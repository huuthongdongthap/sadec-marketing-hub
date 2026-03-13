/**
 * Form Validation Manager - Sa Đéc Marketing Hub
 * Real-time form validation với visual feedback
 *
 * Validation rules: required, email, phone, url, minLength, maxLength, pattern, match, custom
 */

class FormValidator {
  constructor(options = {}) {
    this.options = {
      errorClass: 'field-error',
      successClass: 'field-success',
      errorTextClass: 'field-error-text',
      showSuccessState: true,
      validateOnInput: true,
      debounceMs: 300,
      ...options
    };

    this.forms = new Map();
    this.debounceTimers = new Map();
    this.init();
  }

  /**
   * Initialize validator
   */
  init() {
    // Auto-initialize forms with data-validate attribute
    document.querySelectorAll('form[data-validate]').forEach(form => {
      this.attachForm(form);
    });

    console.log('[FormValidator] Initialized');
  }

  /**
   * Attach validator to a form
   * @param {HTMLFormElement} form
   */
  attachForm(form) {
    const formId = form.id || `form-${Date.now()}`;
    if (!form.id) form.id = formId;

    const formState = {
      element: form,
      fields: new Map(),
      isValid: false,
      submitAttempts: 0
    };

    // Attach submit handler
    form.addEventListener('submit', (e) => this.handleSubmit(e, formState));

    // Attach blur/change handlers to fields
    form.querySelectorAll('input, textarea, select').forEach(field => {
      this.attachField(field, formState);
    });

    this.forms.set(formId, formState);

    return formId;
  }

  /**
   * Attach validation to a single field
   * @param {HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement} field
   * @param {Object} formState
   */
  attachField(field, formState) {
    const fieldName = field.name || field.id || `field-${Date.now()}`;
    const rules = this.parseRules(field);

    if (rules.length === 0) return;

    const fieldState = {
      element: field,
      rules,
      isValid: null,
      errorMessage: '',
      debouncedValue: ''
    };

    formState.fields.set(fieldName, fieldState);

    // Blur validation
    field.addEventListener('blur', () => {
      this.validateField(field, fieldState, formState);
    });

    // Input validation with debounce
    if (this.options.validateOnInput) {
      field.addEventListener('input', (e) => {
        clearTimeout(this.debounceTimers.get(fieldName));

        const timer = setTimeout(() => {
          this.validateField(field, fieldState, formState);
        }, this.options.debounceMs);

        this.debounceTimers.set(fieldName, timer);
      });
    }
  }

  /**
   * Parse validation rules from field attributes
   */
  parseRules(field) {
    const rules = [];

    // Required
    if (field.hasAttribute('required')) {
      rules.push({ type: 'required', message: field.dataset.requiredMsg || 'Trường này bắt buộc' });
    }

    // Email
    if (field.type === 'email' || field.hasAttribute('data-email')) {
      rules.push({
        type: 'email',
        message: field.dataset.emailMsg || 'Email không hợp lệ',
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      });
    }

    // Phone (Vietnam)
    if (field.type === 'tel' || field.hasAttribute('data-phone')) {
      rules.push({
        type: 'phone',
        message: field.dataset.phoneMsg || 'Số điện thoại không hợp lệ',
        pattern: /^(0|\+84)[3579]\d{8}$/
      });
    }

    // URL
    if (field.type === 'url' || field.hasAttribute('data-url')) {
      rules.push({
        type: 'url',
        message: field.dataset.urlMsg || 'URL không hợp lệ',
        pattern: /^https?:\/\/.+/
      });
    }

    // Min length
    if (field.minLength > 0 || field.hasAttribute('data-min-length')) {
      const min = parseInt(field.getAttribute('data-min-length') || field.minLength);
      rules.push({
        type: 'minLength',
        value: min,
        message: field.dataset.minLengthMsg || `Tối thiểu ${min} ký tự`
      });
    }

    // Max length
    if (field.maxLength > 0 || field.hasAttribute('data-max-length')) {
      const max = parseInt(field.getAttribute('data-max-length') || field.maxLength);
      rules.push({
        type: 'maxLength',
        value: max,
        message: field.dataset.maxLengthMsg || `Tối đa ${max} ký tự`
      });
    }

    // Pattern
    if (field.pattern || field.hasAttribute('data-pattern')) {
      const pattern = field.getAttribute('data-pattern') || field.pattern;
      rules.push({
        type: 'pattern',
        pattern: new RegExp(pattern),
        message: field.dataset.patternMsg || 'Định dạng không đúng'
      });
    }

    // Match (password confirmation)
    if (field.hasAttribute('data-match')) {
      rules.push({
        type: 'match',
        target: field.dataset.match,
        message: field.dataset.matchMsg || 'Không khớp'
      });
    }

    // Min value (number)
    if (field.hasAttribute('data-min') || field.type === 'number') {
      const min = parseFloat(field.getAttribute('data-min') || field.min);
      if (!isNaN(min)) {
        rules.push({
          type: 'min',
          value: min,
          message: field.dataset.minMsg || `Phải lớn hơn hoặc bằng ${min}`
        });
      }
    }

    // Max value (number)
    if (field.hasAttribute('data-max') || field.type === 'number') {
      const max = parseFloat(field.getAttribute('data-max') || field.max);
      if (!isNaN(max)) {
        rules.push({
          type: 'max',
          value: max,
          message: field.dataset.maxMsg || `Phải nhỏ hơn hoặc bằng ${max}`
        });
      }
    }

    // Custom validator
    if (field.hasAttribute('data-validate-custom')) {
      const validatorName = field.dataset.validateCustom;
      const customValidator = window.customValidators?.[validatorName];
      if (customValidator) {
        rules.push({
          type: 'custom',
          validator: customValidator,
          message: field.dataset.customMsg || 'Không hợp lệ'
        });
      }
    }

    return rules;
  }

  /**
   * Validate a single field
   */
  validateField(field, fieldState, formState) {
    const value = field.value?.trim() || '';
    let isValid = true;
    let errorMessage = '';

    for (const rule of fieldState.rules) {
      if (!this.testRule(value, rule, field, formState)) {
        isValid = false;
        errorMessage = rule.message;
        break;
      }
    }

    fieldState.isValid = isValid;
    fieldState.errorMessage = errorMessage;

    this.updateFieldUI(field, isValid, errorMessage);

    return isValid;
  }

  /**
   * Test a single rule
   */
  testRule(value, rule, field, formState) {
    // Skip validation if empty and not required
    if (!value && rule.type !== 'required') {
      return true;
    }

    switch (rule.type) {
      case 'required':
        return value !== '' && value.length > 0;

      case 'email':
      case 'phone':
      case 'url':
      case 'pattern':
        return rule.pattern.test(value);

      case 'minLength':
        return value.length >= rule.value;

      case 'maxLength':
        return value.length <= rule.value;

      case 'match':
        const targetField = formState.element.querySelector(`[name="${rule.target}"]`) ||
                           document.getElementById(rule.target);
        return value === targetField?.value;

      case 'min':
        return parseFloat(value) >= rule.value;

      case 'max':
        return parseFloat(value) <= rule.value;

      case 'custom':
        return rule.validator(value, field);

      default:
        return true;
    }
  }

  /**
   * Update field UI with validation state
   */
  updateFieldUI(field, isValid, errorMessage) {
    const fieldWrapper = field.closest('.form-group') || field.parentElement;

    // Remove previous states
    field.classList.remove(this.options.errorClass, this.options.successClass);

    // Remove previous error message
    const existingError = fieldWrapper?.querySelector(`.${this.options.errorTextClass}`);
    existingError?.remove();

    if (isValid === false) {
      // Error state
      field.classList.add(this.options.errorClass);
      field.setAttribute('aria-invalid', 'true');

      if (errorMessage && fieldWrapper) {
        const errorEl = document.createElement('div');
        errorEl.className = this.options.errorTextClass;
        errorEl.textContent = errorMessage;
        errorEl.style.cssText = `
          color: #d32f2f;
          font-size: 12px;
          margin-top: 4px;
        `;
        fieldWrapper.appendChild(errorEl);
      }
    } else if (isValid === true && this.options.showSuccessState) {
      // Success state
      field.classList.add(this.options.successClass);
      field.setAttribute('aria-invalid', 'false');
    }
  }

  /**
   * Handle form submit
   */
  handleSubmit(e, formState) {
    formState.submitAttempts++;

    const results = [];
    formState.fields.forEach((fieldState, fieldName) => {
      const field = fieldState.element;
      results.push(this.validateField(field, fieldState, formState));
    });

    const allValid = results.every(r => r === true);
    formState.isValid = allValid;

    if (!allValid) {
      e.preventDefault();
      e.stopPropagation();

      // Scroll to first invalid field
      const firstInvalid = Array.from(formState.fields.values()).find(f => !f.isValid);
      if (firstInvalid) {
        firstInvalid.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstInvalid.element.focus();
      }

      // Show error toast if available
      if (window.toast) {
        window.toast.error('Vui lòng kiểm tra lại các trường thông tin');
      }

      return false;
    }

    // Form is valid - dispatch custom event
    formState.element.dispatchEvent(new CustomEvent('form-valid', {
      bubbles: true,
      detail: { formData: new FormData(formState.element) }
    }));

    console.log('[FormValidator] Form is valid');
  }

  /**
   * Validate entire form manually
   */
  validateForm(formId) {
    const formState = this.forms.get(formId);
    if (!formState) return false;

    const results = [];
    formState.fields.forEach((fieldState, fieldName) => {
      const field = fieldState.element;
      results.push(this.validateField(field, fieldState, formState));
    });

    return results.every(r => r === true);
  }

  /**
   * Get form validation state
   */
  getFormState(formId) {
    return this.forms.get(formId);
  }

  /**
   * Reset form validation state
   */
  resetForm(formId) {
    const formState = this.forms.get(formId);
    if (!formState) return;

    formState.fields.forEach((fieldState) => {
      const field = fieldState.element;
      field.classList.remove(this.options.errorClass, this.options.successClass);
      field.removeAttribute('aria-invalid');
      fieldState.isValid = null;
      fieldState.errorMessage = '';
    });

    // Remove error messages
    formState.element.querySelectorAll(`.${this.options.errorTextClass}`).forEach(el => el.remove());

    formState.isValid = false;
    formState.submitAttempts = 0;
  }

  /**
   * Detach validator from form
   */
  detachForm(formId) {
    this.forms.delete(formId);
  }
}

// Register custom validators globally
window.customValidators = {};

/**
 * Register a custom validator
 * @param {string} name - Validator name
 * @param {Function} validator - Validation function (value, field) => boolean
 */
function registerCustomValidator(name, validator) {
  window.customValidators[name] = validator;
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.formValidator = new FormValidator();
  });
} else {
  window.formValidator = new FormValidator();
}

export { FormValidator, registerCustomValidator };
