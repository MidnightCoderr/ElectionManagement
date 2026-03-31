import React, { createContext, useContext, useState } from 'react';

const FormContext = createContext();

export function FormProvider({ children }) {
  // Sync with StudentManagement.jsx field names
  const [formData, setFormData] = useState({
    name: '',
    roll_number: '',
    department: '',
    course: '',
    program: ''
  });

  const [showModal, setShowModal] = useState(false);

  const updateFormData = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const resetFormData = () => {
    setFormData({
      name: '',
      roll_number: '',
      department: '',
      course: '',
      program: ''
    });
  };

  return (
    <FormContext.Provider value={{ 
      formData, 
      updateFormData, 
      resetFormData,
      showModal,
      setShowModal
    }}>
      {children}
    </FormContext.Provider>
  );
}

export function useFormState() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormState must be used within a FormProvider');
  }
  return context;
}
