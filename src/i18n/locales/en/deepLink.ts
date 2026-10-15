/** English texts: deepLink. Keys are used with useTranslation('deepLink'). */
const deepLink = {
  title: 'Deep linking',
  description:
    'This button opens a URL instead of navigating. Android / iOS route it back to this app, React Navigation turns it into a screen with params, and the form focuses and highlights the Comments field.',
  urlLabel: 'URL',
  button: 'Leave a comment',
  openError: {
    title: 'Could not open the link',
    message: 'Rebuild the app so the rnexamples:// scheme is registered.',
  },
  outside: {
    title: 'Try it from outside the app',
    description:
      'The same link works when the app is closed or in the background.',
    android: 'Android (emulator or device)',
    ios: 'iOS simulator',
  },
};

export default deepLink;
