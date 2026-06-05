import User from '../models/User.js';
import OTP from '../models/OTP.js';
import sendOTPEmail from '../config/mailer.js';
import jwt from 'jsonwebtoken';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Register a user — Step 1: Send OTP
// @route   POST /api/auth/signup-request
// @access  Public
export const signupRequest = async (req, res) => {
  const { name, email, password, role, department, semester, studentId, facultyId } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Only one admin account is allowed across the entire system
    if (role === 'admin') {
      const adminExists = await User.findOne({ role: 'admin' });
      if (adminExists) {
        return res.status(400).json({
          message: 'An administrator account already exists. Only one admin is allowed. Please register as a Student or Faculty member.',
        });
      }
    }

    // Check unique role-based IDs
    if (role === 'student' && studentId) {
      const idExists = await User.findOne({ studentId });
      if (idExists) return res.status(400).json({ message: 'Student ID already registered' });
    } else if (role === 'faculty' && facultyId) {
      const idExists = await User.findOne({ facultyId });
      if (idExists) return res.status(400).json({ message: 'Faculty ID already registered' });
    }

    // Remove any previous OTP for this email+purpose
    await OTP.deleteMany({ email, purpose: 'signup' });

    const otp = generateOTP();

    // Store signup data temporarily in the OTP record (password will be hashed on user creation)
    await OTP.create({
      email,
      otp,
      purpose: 'signup',
      tempUserData: {
        name,
        email,
        password,
        role: role || 'student',
        department,
        semester: role === 'student' ? Number(semester) : undefined,
        studentId: role === 'student' ? studentId : undefined,
        facultyId: role === 'faculty' ? facultyId : undefined,
      },
    });

    // Send OTP email
    await sendOTPEmail(email, name, otp, 'signup');

    res.status(200).json({ message: 'OTP sent to your email. Please verify to complete registration.', email });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: error.message || 'Server error during signup' });
  }
};

// @desc    Login user — Step 1: Validate credentials, send OTP
// @route   POST /api/auth/login-request
// @access  Public
export const loginRequest = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Remove any previous login OTP for this email
    await OTP.deleteMany({ email, purpose: 'login' });

    const otp = generateOTP();
    await OTP.create({ email, otp, purpose: 'login' });

    // Send OTP email
    await sendOTPEmail(email, user.name, otp, 'login');

    res.status(200).json({ message: 'OTP sent to your email. Please verify to sign in.', email });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message || 'Server error during login' });
  }
};


// @desc    Verify OTP for login/signup
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOTP = async (req, res) => {
  const { email, otp, purpose } = req.body;

  try {
    // Find OTP record
    const otpRecord = await OTP.findOne({ email, otp, purpose });
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP. Please request a new one.' });
    }

    let user;

    if (purpose === 'signup') {
      const { tempUserData } = otpRecord;
      if (!tempUserData) {
        return res.status(400).json({ message: 'Signup data not found. Please register again.' });
      }

      // Create new user
      user = await User.create(tempUserData);
    } else if (purpose === 'login') {
      // Find existing user
      user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
    }

    // Delete OTP record
    await OTP.deleteOne({ _id: otpRecord._id });

    // Respond with user and JWT token
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      semester: user.semester,
      studentId: user.studentId,
      facultyId: user.facultyId,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: error.message || 'Server error during OTP verification' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        semester: user.semester,
        studentId: user.studentId,
        facultyId: user.facultyId,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/auth/users
// @access  Private (Admin)
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ role: 1, name: 1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a user (admin)
// @route   PUT /api/auth/users/:id
// @access  Private (Admin)
export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, email, department, semester, studentId, facultyId, role } = req.body;

    // Check email uniqueness if changed
    if (email && email !== user.email) {
      const emailTaken = await User.findOne({ email });
      if (emailTaken) return res.status(400).json({ message: 'Email already in use by another account' });
    }

    user.name       = name       ?? user.name;
    user.email      = email      ?? user.email;
    user.department = department ?? user.department;
    user.role       = role       ?? user.role;

    if (user.role === 'student') {
      user.semester  = semester  !== undefined ? Number(semester) : user.semester;
      user.studentId = studentId ?? user.studentId;
      user.facultyId = undefined;
    } else if (user.role === 'faculty') {
      user.facultyId = facultyId ?? user.facultyId;
      user.semester  = undefined;
      user.studentId = undefined;
    } else {
      user.semester  = undefined;
      user.studentId = undefined;
      user.facultyId = undefined;
    }

    const updated = await user.save();
    res.status(200).json({
      _id:        updated._id,
      name:       updated.name,
      email:      updated.email,
      role:       updated.role,
      department: updated.department,
      semester:   updated.semester,
      studentId:  updated.studentId,
      facultyId:  updated.facultyId,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a user (admin)
// @route   DELETE /api/auth/users/:id
// @access  Private (Admin)
export const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
