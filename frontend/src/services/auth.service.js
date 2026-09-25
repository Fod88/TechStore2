import api from './api';
import { normalizeUser } from '../utils/normalize';

const toSession = (data) => (data?.token ? { token: data.token, user: normalizeUser(data.user) } : null);

export const authService = {
  // POST /users/login  ->  { user: { id, name, email, role }, token }
  async login({ email, password }) {
    const { data } = await api.post('/users/login', { email, password });
    const session = toSession(data);
    if (!session) throw new Error('Unexpected response from the server.');
    return session;
  },

  // POST /users/register  ->  201 { id, name, email, role }   (no token: the caller signs in afterwards)
  async register({ name, email, password }) {
    await api.post('/users/register', { name, email, password });
  },
};
