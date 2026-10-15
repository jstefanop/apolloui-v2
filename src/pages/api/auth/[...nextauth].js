import axios from 'axios';
import os from 'os';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions = {
  // Configure one or more authentication providers
  pages: {
    signIn: '/signin',
    error: '/signin', // Redirect to signin page on error
  },
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        try {
          let hostnameApi = process.env.NEXT_PUBLIC_GRAPHQL_HOST || os.hostname();
          const portApi = process.env.NEXT_PUBLIC_GRAPHQL_PORT || 5000;

          console.log('Attempting authentication...');

          const authData = await axios({
            url: `http://${hostnameApi}:${portApi}/api/graphql`,
            method: 'post',
            data: {
              query: `
                  query Login($input: AuthLoginInput!) {
                    Auth {
                      login(input: $input) {
                        result {
                          accessToken
                        }
                        error {
                          message
                          type
                          severity
                          reasons {
                            path
                            message
                            reason
                          }
                        }
                      }
                    }
                  }
                `,
              variables: {
                input: {
                  password: credentials.password
                }
              }
            },
          });

          const { result, error } = authData?.data?.data?.Auth?.login;

          if (error) {
            console.log('Authentication refused:', error.message);
            return null;
          }

          if (!result || !result.accessToken) {
            console.log('Authentication failed: empty login response');
            return null;
          }

          const { accessToken } = result;
          console.log('Authentication successful');

          // Must be name because NextAuth doesn't allow 
          // other kind of properties excluding email, name, image
          return { name: accessToken };
        } catch (err) {
          // The message only: the response and the request carry the credentials.
          console.log('Authentication exception:', err?.message);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      if (!user) {
        return false;
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      // If the URL is the signin page and we have a valid session, redirect to the main page
      if (url.includes('/signin')) {
        return baseUrl;
      }
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
    async session({ session, token, user }) {
      return session;
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.accessToken = user.name;
      }
      return token;
    },
  },
};

export default NextAuth(authOptions);
