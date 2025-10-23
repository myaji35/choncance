import 'next-auth';

declare module 'next-auth' {
  /**
   * Extends the built-in session.user type to include the 'id' property.
   */
  interface Session {
    user: {
      id: string; // Add the id property
    } & DefaultSession['user']; // Keep the default properties like name, email, image
  }
}
