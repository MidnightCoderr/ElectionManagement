/**
 * Security Audit Tools
 * Automated security checks and vulnerability scanning
 */

const fs = require('fs');
const path = require('path');

class SecurityAuditor {
    constructor() {
        this.findings = [];
    }

    /**
     * Run comprehensive security audit
     */
    async runAudit() {
        console.log('🔍 Starting security audit...\n');

        this.findings = [];

        // Run all checks
        await this.checkEnvironmentVariables();
        await this.checkDependencyVulnerabilities();
        await this.checkFilePermissions();
        await this.checkEncryptionKeys();
        await this.checkAPIEndpoints();
        await this.checkDatabaseSecurity();

        // Generate report
        return this.generateReport();
    }

    /**
     * Check environment variables
     */
    async checkEnvironmentVariables() {
        console.log('Checking environment variables...');

        const requiredVars = [
            'ENCRYPTION_MASTER_KEY',
            'JWT_SECRET',
            'DB_PASSWORD',
            'MONGODB_PASSWORD',
            'REDIS_PASSWORD',
        ];

        const missing = [];
        const weak = [];

        for (const varName of requiredVars) {
            const value = process.env[varName];

            if (!value) {
                missing.push(varName);
            } else if (value.length < 32) {
                weak.push(varName);
            }
        }

        if (missing.length > 0) {
            this.addFinding('CRITICAL', 'Missing environment variables', {
                variables: missing,
                recommendation: 'Set all required environment variables',
            });
        }

        if (weak.length > 0) {
            this.addFinding('HIGH', 'Weak encryption keys', {
                variables: weak,
                recommendation: 'Use keys with at least 32 characters',
            });
        }
    }

    /**
     * Check for dependency vulnerabilities
     */
    async checkDependencyVulnerabilities() {
        console.log('Checking dependencies...');

        // In production, use npm audit or snyk
        // This is a simplified check

        try {
            const packageJson = require('../../../package.json');
            const dependencies = Object.keys(packageJson.dependencies || {});

            // Check for known vulnerable packages (simplified)
            const vulnerablePatterns = [
                'request', // Deprecated
                'node-uuid', // Use uuid instead
            ];

            const found = dependencies.filter(dep =>
                vulnerablePatterns.some(pattern => dep.includes(pattern))
            );

            if (found.length > 0) {
                this.addFinding('MEDIUM', 'Potentially vulnerable dependencies', {
                    packages: found,
                    recommendation: 'Run npm audit and update vulnerable packages',
                });
            }
        } catch (error) {
            this.addFinding('LOW', 'Could not check dependencies', {
                error: error.message,
            });
        }
    }

    /**
     * Check file permissions
     */
    async checkFilePermissions() {
        console.log('Checking file permissions...');

        const sensitiveFiles = [
            '.env',
            'config/database.js',
            'config/blockchain.js',
        ];

        const issues = [];

        for (const file of sensitiveFiles) {
            const filePath = path.join(__dirname, '../../../', file);

            if (fs.existsSync(filePath)) {
                try {
                    const stats = fs.statSync(filePath);
                    const mode = stats.mode & parseInt('777', 8);

                    // Check if world-readable (too permissive)
                    if (mode & parseInt('004', 8)) {
                        issues.push({
                            file,
                            mode: mode.toString(8),
                            issue: 'World-readable',
                        });
                    }
                } catch (error) {
                    // Skip if can't read
                }
            }
        }

        if (issues.length > 0) {
            this.addFinding('HIGH', 'Insecure file permissions', {
                files: issues,
                recommendation: 'Set files to 600 (rw-------)',
            });
        }
    }

    /**
     * Check encryption key strength
     */
    async checkEncryptionKeys() {
        console.log('Checking encryption keys...');

        const masterKey = process.env.ENCRYPTION_MASTER_KEY;

        if (masterKey) {
            // Check entropy
            const uniqueChars = new Set(masterKey).size;
            const minEntropy = 20; // Should have at least 20 unique characters

            if (uniqueChars < minEntropy) {
                this.addFinding('HIGH', 'Low entropy encryption key', {
                    uniqueCharacters: uniqueChars,
                    recommended: minEntropy,
                    recommendation: 'Generate keys with crypto.randomBytes(32)',
                });
            }
        }
    }

    /**
     * Check API endpoint security
     */
    async checkAPIEndpoints() {
        console.log('Checking API endpoints...');

        // Check for rate limiting
        const rateLimitExists = fs.existsSync(
            path.join(__dirname, '../middleware/rateLimit.middleware.js')
        );

        if (!rateLimitExists) {
            this.addFinding('HIGH', 'Missing rate limiting', {
                recommendation: 'Implement rate limiting on all API endpoints',
            });
        }

        // Check for authentication middleware
        const authExists = fs.existsSync(
            path.join(__dirname, '../middleware/auth.middleware.js')
        );

        if (!authExists) {
            this.addFinding('CRITICAL', 'Missing authentication middleware', {
                recommendation: 'Implement JWT authentication',
            });
        }
    }

    /**
     * Check database security
     */
    async checkDatabaseSecurity() {
        console.log('Checking database security...');

        // Check if using default passwords
        const dbPassword = process.env.DB_PASSWORD;
        const mongoPassword = process.env.MONGODB_PASSWORD;

        const defaultPasswords = ['password', 'admin', '123456', 'postgres'];

        if (defaultPasswords.includes(dbPassword)) {
            this.addFinding('CRITICAL', 'Default database password detected', {
                recommendation: 'Change to strong, unique password',
            });
        }

        if (defaultPasswords.includes(mongoPassword)) {
            this.addFinding('CRITICAL', 'Default MongoDB password detected', {
                recommendation: 'Change to strong, unique password',
            });
        }
    }

    /**
     * Add security finding
     */
    addFinding(severity, title, details) {
        this.findings.push({
            severity,
            title,
            details,
            timestamp: new Date().toISOString(),
        });

        const icon = {
            CRITICAL: '🔴',
            HIGH: '🟠',
            MEDIUM: '🟡',
            LOW: '🔵',
        }[severity];

        console.log(`${icon} ${severity}: ${title}`);
    }

    /**
     * Generate audit report
     */
    generateReport() {
        const summary = {
            critical: this.findings.filter(f => f.severity === 'CRITICAL').length,
            high: this.findings.filter(f => f.severity === 'HIGH').length,
            medium: this.findings.filter(f => f.severity === 'MEDIUM').length,
            low: this.findings.filter(f => f.severity === 'LOW').length,
        };

        const report = {
            timestamp: new Date().toISOString(),
            summary,
            findings: this.findings,
            totalIssues: this.findings.length,
            passed: this.findings.length === 0,
        };

        console.log('\n📋 Audit Summary:');
        console.log(`   Critical: ${summary.critical}`);
        console.log(`   High: ${summary.high}`);
        console.log(`   Medium: ${summary.medium}`);
        console.log(`   Low: ${summary.low}`);
        console.log(`   Total Issues: ${report.totalIssues}\n`);

        if (report.passed) {
            console.log('✅ Security audit passed!\n');
        } else {
            console.log('❌ Security audit found issues\n');
        }

        return report;
    }

    /**
     * Save report to file
     */
    saveReport(report, filename = 'security-audit.json') {
        const reportPath = path.join(__dirname, '../../../reports', filename);

        // Ensure reports directory exists
        const dir = path.dirname(reportPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        console.log(`Report saved to: ${reportPath}`);
    }
}

// CLI usage
if (require.main === module) {
    const auditor = new SecurityAuditor();

    auditor.runAudit().then(report => {
        auditor.saveReport(report);

        // Exit with error code if critical issues found
        if (report.summary.critical > 0) {
            process.exit(1);
        }
    });
}

module.exports = {
    SecurityAuditor,
};
