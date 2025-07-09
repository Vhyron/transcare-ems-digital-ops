import { createAdmin } from '../actions/auth.action';

async function main() {
  const { data, error } = await createAdmin({
    email: 'admin@email.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
  });

  if (error) {
    console.error('Error creating admin:', error);
    return;
  }

  if (data) {
    console.log('Admin created successfully:', data);
  } else {
    console.log('No data returned from createAdmin');
  }
}

main();
