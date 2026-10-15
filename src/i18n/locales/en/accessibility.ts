/** English texts: accessibility. Keys are used with useTranslation('accessibility'). */
const accessibility = {
  status: {
    a11yOn: '{{reader}} is on',
    a11yOff: '{{reader}} is off',
    on: '{{reader}} is ON',
    off: '{{reader}} is OFF — turn it on to try this screen',
  },
  title: 'Accessible form',
  imageLabel: 'Random landscape photo from Lorem Picsum',
  name: {
    label: 'Name',
    placeholder: 'John Smith',
    hint: 'Type your full name',
  },
  date: {
    label: 'Date',
    hint: 'Opens a calendar to choose the date',
  },
  submit: {
    label: 'Submit',
    hint: 'Sends the form',
  },
  errors: {
    nameRequired: 'Name is required',
    dateRequired: 'Date is required',
    announce_one: 'The form has {{count}} error',
    announce_other: 'The form has {{count}} errors',
  },
  submitted: {
    title: 'Information submitted',
    message: 'Submitted: {{name}}, {{date}}',
    announce: 'Information submitted. {{message}}',
  },
  tips: {
    title: 'How to try it',
    ios: '• iOS: Settings › Accessibility › VoiceOver. Swipe right/left to move, double-tap to activate.',
    android:
      '• Android: Settings › Accessibility › TalkBack. Swipe right/left to move, double-tap to activate.',
    errors: '• Submit with empty fields to hear the errors.',
  },
};

export default accessibility;
