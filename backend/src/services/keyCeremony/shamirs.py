"""
Shamir Secret Sharing Implementation
Pure Python implementation of Shamir's Secret Sharing scheme
"""

import random
from typing import List, Tuple


class ShamirSecretSharing:
    """Shamir Secret Sharing over finite field"""
    
    # Large prime for finite field (256-bit prime)
    PRIME = 2**256 - 189
    
    @staticmethod
    def _evaluate_polynomial(coefficients: List[int], x: int, prime: int) -> int:
        """
        Evaluate polynomial at point x using Horner's method
        
        Args:
            coefficients: Polynomial coefficients [a0, a1, a2, ...]
            x: Point to evaluate at
            prime: Prime modulus
            
        Returns:
            Polynomial value at x (mod prime)
        """
        result = 0
        for coef in reversed(coefficients):
            result = (result * x + coef) % prime
        return result
    
    @staticmethod
    def _extended_gcd(a: int, b: int) -> Tuple[int, int, int]:
        """Extended Euclidean algorithm"""
        if a == 0:
            return b, 0, 1
        gcd, x1, y1 = ShamirSecretSharing._extended_gcd(b % a, a)
        x = y1 - (b // a) * x1
        y = x1
        return gcd, x, y
    
    @staticmethod
    def _mod_inverse(a: int, prime: int) -> int:
        """Calculate modular multiplicative inverse"""
        gcd, x, _ = ShamirSecretSharing._extended_gcd(a, prime)
        if gcd != 1:
            raise ValueError("Modular inverse does not exist")
        return (x % prime + prime) % prime
    
    @staticmethod
    def split_secret(secret: int, threshold: int, num_shares: int) -> List[Tuple[int, int]]:
        """
        Split secret into shares using Shamir Secret Sharing
        
        Args:
            secret: Secret value to split
            threshold: Minimum shares needed to reconstruct
            num_shares: Total number of shares to generate
            
        Returns:
            List of (x, y) shares
        """
        if threshold > num_shares:
            raise ValueError("Threshold cannot exceed number of shares")
        
        if secret >= ShamirSecretSharing.PRIME:
            raise ValueError("Secret must be less than prime modulus")
        
        # Generate random polynomial coefficients
        # Polynomial: f(x) = secret + a1*x + a2*x^2 + ... + a(t-1)*x^(t-1)
        coefficients = [secret] + [
            random.randint(0, ShamirSecretSharing.PRIME - 1)
            for _ in range(threshold - 1)
        ]
        
        # Generate shares by evaluating polynomial at different points
        shares = []
        for i in range(1, num_shares + 1):
            x = i
            y = ShamirSecretSharing._evaluate_polynomial(
                coefficients, x, ShamirSecretSharing.PRIME
            )
            shares.append((x, y))
        
        return shares
    
    @staticmethod
    def reconstruct_secret(shares: List[Tuple[int, int]], threshold: int) -> int:
        """
        Reconstruct secret from shares using Lagrange interpolation
        
        Args:
            shares: List of (x, y) shares
            threshold: Minimum shares needed
            
        Returns:
            Reconstructed secret
        """
        if len(shares) < threshold:
            raise ValueError(f"Need at least {threshold} shares, got {len(shares)}")
        
        # Use first 'threshold' shares
        shares = shares[:threshold]
        
        # Lagrange interpolation at x=0
        secret = 0
        prime = ShamirSecretSharing.PRIME
        
        for i, (xi, yi) in enumerate(shares):
            # Calculate Lagrange basis polynomial at x=0
            numerator = 1
            denominator = 1
            
            for j, (xj, _) in enumerate(shares):
                if i != j:
                    numerator = (numerator * (-xj)) % prime
                    denominator = (denominator * (xi - xj)) % prime
            
            # Calculate Lagrange coefficient
            lagrange_coef = (numerator * ShamirSecretSharing._mod_inverse(denominator, prime)) % prime
            
            # Add contribution to secret
            secret = (secret + yi * lagrange_coef) % prime
        
        return secret


# Convenience functions
def split_secret(secret: int, threshold: int, num_shares: int) -> List[int]:
    """
    Split secret into shares
    
    Returns:
        List of share values (y-coordinates, x is implicit 1..n)
    """
    shares = ShamirSecretSharing.split_secret(secret, threshold, num_shares)
    return [y for _, y in shares]


def reconstruct_secret(shares: List[int], threshold: int) -> int:
    """
    Reconstruct secret from share values
    
    Args:
        shares: List of share values (y-coordinates)
        threshold: Minimum shares needed
    """
    # Add x-coordinates (1, 2, 3, ...)
    shares_with_x = [(i + 1, y) for i, y in enumerate(shares)]
    return ShamirSecretSharing.reconstruct_secret(shares_with_x, threshold)


def test_shamirs():
    """Test Shamir Secret Sharing"""
    print("Testing Shamir Secret Sharing")
    print("=" * 50)
    
    # Test secret
    secret = 123456789012345678901234567890
    threshold = 5
    num_shares = 7
    
    print(f"\nOriginal Secret: {secret}")
    print(f"Threshold: {threshold}")
    print(f"Num Shares: {num_shares}")
    
    # Split secret
    shares = split_secret(secret, threshold, num_shares)
    print(f"\nGenerated {len(shares)} shares:")
    for i, share in enumerate(shares, 1):
        print(f"  Share {i}: {share}")
    
    # Reconstruct with threshold shares
    print(f"\nReconstructing with {threshold} shares...")
    reconstructed = reconstruct_secret(shares[:threshold], threshold)
    print(f"Reconstructed Secret: {reconstructed}")
    
    # Verify
    if secret == reconstructed:
        print("\n✅ SUCCESS: Secret reconstructed correctly!")
    else:
        print("\n❌ FAILURE: Reconstruction failed!")
    
    # Try with fewer shares (should fail)
    print(f"\nTrying with only {threshold-1} shares...")
    try:
        reconstructed_fail = reconstruct_secret(shares[:threshold-1], threshold)
        print(f"Reconstructed: {reconstructed_fail}")
    except ValueError as e:
        print(f"✅ Expected failure: {e}")


if __name__ == '__main__':
    test_shamirs()
