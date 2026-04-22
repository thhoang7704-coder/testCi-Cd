import React, { createContext, useContext, ReactNode } from 'react';

interface FormContextType {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  handleChange: (name: string, value: any) => void;
  handleBlur: (name: string) => void;
  setFieldValue: (name: string, value: any) => void;
  setFieldError: (name: string, error: string) => void;
}

const FormContext = createContext<FormContextType | null>(null);

export interface FormProps {
  initialValues: Record<string, any>;
  onSubmit: (values: Record<string, any>) => void | Promise<void>;
  validationSchema?: any;
  children: ReactNode;
  className?: string;
}

export const Form: React.FC<FormProps> = ({
  initialValues,
  onSubmit,
  validationSchema,
  children,
  className = ''
}) => {
  const [values, setValues] = React.useState(initialValues);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});

  const handleChange = (name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));

    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));

    // Validate field if validation schema exists
    if (validationSchema) {
      try {
        validationSchema.validateAt(name, values);
        setErrors(prev => ({ ...prev, [name]: '' }));
      } catch (error: any) {
        setErrors(prev => ({ ...prev, [name]: error.message }));
      }
    }
  };

  const setFieldValue = (name: string, value: any) => {
    handleChange(name, value);
  };

  const setFieldError = (name: string, error: string) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {};
    Object.keys(values).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    // Validate all fields
    if (validationSchema) {
      try {
        await validationSchema.validate(values, { abortEarly: false });
        setErrors({});
      } catch (validationErrors: any) {
        const newErrors: Record<string, string> = {};
        validationErrors.inner.forEach((error: any) => {
          newErrors[error.path] = error.message;
        });
        setErrors(newErrors);
        return;
      }
    }

    // Submit form
    await onSubmit(values);
  };

  const contextValue: FormContextType = {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setFieldValue,
    setFieldError
  };

  return (
    <FormContext.Provider value={contextValue}>
      <form onSubmit={handleSubmit} className={className}>
        {children}
      </form>
    </FormContext.Provider>
  );
};

export interface FieldProps {
  name: string;
  label?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  children?: ReactNode;
  className?: string;
  as?: 'input' | 'textarea' | 'select';
  options?: { value: string; label: string }[];
}

export const Field: React.FC<FieldProps> = ({
  name,
  label,
  type = 'text',
  placeholder,
  required = false,
  children,
  className = '',
  as = 'input',
  options = []
}) => {
  const context = useContext(FormContext);

  if (!context) {
    throw new Error('Field must be used within a Form component');
  }

  const { values, errors, touched, handleChange, handleBlur } = context;

  const hasError = errors[name] && touched[name];
  const fieldClassName = `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
    hasError ? 'border-red-300' : 'border-gray-300'
  } ${className}`;

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    handleChange(name, e.target.value);
  };

  const renderField = () => {
    switch (as) {
      case 'textarea':
        return (
          <textarea
            id={name}
            name={name}
            value={values[name] || ''}
            onChange={handleFieldChange}
            onBlur={() => handleBlur(name)}
            placeholder={placeholder}
            required={required}
            className={fieldClassName}
            rows={4}
          />
        );

      case 'select':
        return (
          <select
            id={name}
            name={name}
            value={values[name] || ''}
            onChange={handleFieldChange}
            onBlur={() => handleBlur(name)}
            required={required}
            className={fieldClassName}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      default:
        return (
          <input
            id={name}
            name={name}
            type={type}
            value={values[name] || ''}
            onChange={handleFieldChange}
            onBlur={() => handleBlur(name)}
            placeholder={placeholder}
            required={required}
            className={fieldClassName}
          />
        );
    }
  };

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {renderField()}

      {hasError && (
        <p className="mt-1 text-sm text-red-600">{errors[name]}</p>
      )}

      {children}
    </div>
  );
};

export interface FormActionsProps {
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  loading?: boolean;
  className?: string;
}

export const FormActions: React.FC<FormActionsProps> = ({
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  onCancel,
  loading = false,
  className = ''
}) => {
  return (
    <div className={`flex justify-end space-x-4 ${className}`}>
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          disabled={loading}
        >
          {cancelLabel}
        </button>
      )}

      <button
        type="submit"
        className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Submitting...' : submitLabel}
      </button>
    </div>
  );
};

// Hook to use form context
export const useForm = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useForm must be used within a Form component');
  }
  return context;
};
