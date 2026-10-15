/** English texts: forms. Keys are used with useTranslation('forms'). */
const forms = {
  textField: {
    counterA11y: '{{length}} of {{max}} characters',
  },
  selectField: {
    placeholder: 'Select an option',
  },
  dateField: {
    placeholder: 'Select a date',
    hint: 'Opens a calendar to choose a date',
    notSelected: 'Not selected',
    cancel: 'Cancel',
    cancelHint: 'Closes the calendar without changing the date',
    done: 'Done',
    doneHint: 'Saves the selected date',
  },
  person: {
    name: {
      label: 'Name',
      placeholder: 'John Smith',
    },
    birthDate: {
      label: 'Birth date',
    },
    phone: {
      label: 'Phone',
      placeholder: '+1 555 123 4567',
    },
    email: {
      label: 'Email',
      placeholder: 'john@example.com',
    },
    address: {
      label: 'Address',
      placeholder: '221B Baker Street, London',
    },
    color: {
      label: 'Color',
      placeholder: 'Select a color',
      options: {
        red: 'red',
        blue: 'blue',
        yellow: 'yellow',
      },
    },
    comments: {
      label: 'Comments',
      placeholder: 'Anything else you want to tell us?',
    },
    submit: 'Submit',
    submitted: 'Information submitted',
  },
  validation: {
    nameRequired: 'Name is required',
    nameMin: 'Name must have at least {{min}} characters',
    birthDateRequired: 'Birth date is required',
    birthDateFuture: 'Birth date cannot be in the future',
    adult: 'You must be at least {{age}} years old',
    phoneRequired: 'Phone is required',
    phoneFormat: 'Only digits, spaces, dashes and a leading +',
    phoneLength: 'Phone must have between {{min}} and {{max}} digits',
    emailRequired: 'Email is required',
    emailInvalid: 'Enter a valid email address',
    addressRequired: 'Address is required',
    colorInvalid: 'Choose a valid color',
    commentsMax: 'Comments cannot exceed {{max}} characters',
  },
};

export default forms;
