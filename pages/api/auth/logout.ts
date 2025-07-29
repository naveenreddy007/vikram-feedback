import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Since we're using JWT tokens, logout is handled client-side
  // by removing the token from localStorage
  return res.status(200).json({
    success: true,
    message: 'Logout successful',
    timestamp: new Date().toISOString()
  });
}