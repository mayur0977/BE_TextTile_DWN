import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// Define the User document interface
interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  passwordChangedAt?: Date;
  role: string;
  // eslint-disable-next-line no-unused-vars
  correctPassword(candidatePassword: string | Buffer, userPassword: string): Promise<boolean>;
  // eslint-disable-next-line no-unused-vars
  changedPasswordAfter(JWTTimeStamp: number): boolean;
}

const userSchema = new mongoose.Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Please provide your name.'],

    lowercase: true, // convert data to lowercase
  },
  email: {
    type: String,
    required: [true, 'Please provide your email.'],
    unique: true,
    lowercase: true, // convert data to lowercase
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please provide your confirm password'],
    minlength: 8,
  },
  passwordChangedAt: Date,
  role: {
    type: String,
    enum: ['retailer', 'supplier', 'manufacturer', 'admin', 'user'],
    default: 'retailer',
  },
});

// middleware to encrypt the password before saving the data
userSchema.pre('save', async function (next) {
  // this will only run if password is modified
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  // delete passwordConfirm field before saving the data as this field is required for temporary confirmation
  this.passwordConfirm = '';
  next();
});

//  instance method
userSchema.methods.correctPassword = async function (candidatePassword: string | Buffer, userPassword: string) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
userSchema.methods.changedPasswordAfter = function (JWTTimeStamp: number) {
  if (this.passwordChangedAt) {
    const changedTimestamp = this.passwordChangedAt.getTime() / 1000;
    // console.log('PASSS', JWTTimeStamp, changedTimestamp);
    return JWTTimeStamp < changedTimestamp; // it will check if issues password change called after issuing the jwt token.
  }
  // False means Not changed
  return false;
};

const User = mongoose.model('users', userSchema);
export default User;
