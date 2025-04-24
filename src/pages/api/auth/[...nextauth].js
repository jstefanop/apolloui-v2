import axios from 'axios';
import os from 'os';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions = {
  // Configure one or more authentication providers
  pages: {
    signIn: '/signin',
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

          console.log(`http://${hostnameApi}:${portApi}/api/graphql`);

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
            const errorMessage = error.message || 'Invalid password';
            throw new Error(errorMessage);
          }

          const { accessToken } = result;

          // Must be name because NextAuth doesn't allow 
          // other kind of properties excluding email, name, image
          return { name: accessToken };
        } catch (err) {
          console.log(err?.response?.data);
          // Format the error message properly
          const errorMessage = err?.response?.data?.errors?.[0]?.message || 
                             err?.message || 
                             'Authentication failed';
          throw new Error(errorMessage);
        }
      },
    }),
  ],
};
export default NextAuth(authOptions);
