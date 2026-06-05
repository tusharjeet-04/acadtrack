import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      enum: ['signup', 'login'],
      required: true,
    },
    tempUserData: {
      type: Object, // Holds user signup info until OTP is verified
      required: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 300, // Automatic deletion after 300 seconds (5 minutes)
    },
  }
);

// Add compound index for quick OTP lookup
otpSchema.index({ email: 1, otp: 1 });

const OTP = mongoose.model('OTP', otpSchema);
export default OTP;
