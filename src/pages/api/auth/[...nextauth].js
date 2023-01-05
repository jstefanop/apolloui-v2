import { useQuery } from '@apollo/client';
import axios from 'axios';
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
          const authData = await axios({
            url: 'http://192.168.86.38:5000/api/graphql',
            method: 'post',
            data: {
              query: `
                  {
                    Auth {
                      login(input: {password: "pippo"}) {
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
            },
          });

          const { result, error } = authData?.data?.data?.Auth?.login;

          if (error) throw new Error(error.message);

          const { accessToken } = result;

          // Must be name because NextAuth doesn't allow 
          // other kind of properties excluding email, name, image
          return { name: accessToken };
        } catch (err) {
          throw err;
        }
      },
    }),
  ],
};
export default NextAuth(authOptions);
