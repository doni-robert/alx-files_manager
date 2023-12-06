import Queue from 'bull';
import UsersCollection from '../utils/users';


const userQueue = Queue('send welcome email');

class UsersController {
  
  static async postNew(req, res) {
    const { email, password } = req.body;
    if (email === undefined) {
      res.status(400).json({ error: 'Missing email' });
    } else if (password === undefined) {
      res.status(400).json({ error: 'Missing password' });
    } else if (await UsersCollection.getUser({ email })) {
      res.status(400).json({ error: 'Already exist' });
    } else {

      const userId = await UsersCollection.createUser(email, password);
      userQueue.add({ userId });
      res.status(201).json({ id: userId, email });
    }
  }
}

export default UsersController;