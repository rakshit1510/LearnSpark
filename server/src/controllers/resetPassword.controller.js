import {User} from '../models/user.model.js';
import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import {ApiResponse} from '../utils/ApiResponse.js';
import crypto from 'crypto';
import mailSender from '../utils/mailSender.js';
import passwordUpdated from '../email/templates/passwordUpdate.js';


const resetPasswordToken = asyncHandler(async (req, res) => {
  try {
      const { email } = req.body;
  
      if (!email) {
          throw new ApiError(400, 'Email is required');
      }
  
      const user = await User.findOne({ email });
      if (!user) {
          throw new ApiError(404, 'User not found');
      }
    const token = crypto.randomBytes(20).toString("hex");
  
          // update user by adding token & token expire date
          const updatedUser = await User.findOneAndUpdate(
              { email: email },
              { token: token, resetPasswordTokenExpires: Date.now() + 5 * 60 * 1000 },
              { new: true }); // by marking true, it will return updated user
  
      const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/reset-password/${token}`;
  
      const message = passwordUpdated(email, resetUrl);
      await mailSender(
          email,
          'Password Reset',
          message
      );
  
      res.status(200).json(new ApiResponse(200, 'Password reset email sent successfully'));
  
  } catch (error) {
      console.error('Error in resetPasswordToken:', error);
      throw new ApiError(500, 'Internal Server Error', error.message);
    
  }});


const resetPassword = asyncHandler(async (req, res) => {
  try {
     const token = req.body?.token || req.cookies?.token || req.header('Authorization')?.replace('Bearer ', '');
     const { password, confirmPassword } = req.body;

      if (!token || !password || !confirmPassword) {
          throw new ApiError(400, 'Token, password, and confirmPassword are required');
      }
      if (password !== confirmPassword) {
          throw new ApiError(400, 'Passwords do not match');
      }
      const newPassword = password; // You might want to hash this password before saving it
      const user = await User.findOne({
          token: token,
          resetPasswordTokenExpires: { $gt: Date.now() }
      });

      if (!user) {
          throw new ApiError(404, 'Invalid or expired token');
      }

      user.password = newPassword;
      user.token = undefined;
      user.resetPasswordTokenExpires = undefined;

      await user.save();

      res.status(200).json(new ApiResponse(200, 'Password updated successfully'));
  } catch (error) {
      console.error('Error in resetPassword:', error);
      throw new ApiError(500, 'Internal Server Error', error.message);
  }
});

export {
    resetPasswordToken,
    resetPassword

};

