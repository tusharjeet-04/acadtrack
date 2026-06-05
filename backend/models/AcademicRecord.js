import mongoose from 'mongoose';

const academicRecordSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    courses: [
      {
        course: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Course',
          required: true,
        },
        marksObtained: {
          type: Number,
          required: true,
          min: 0,
          max: 100,
        },
        maxMarks: {
          type: Number,
          default: 100,
        },
        grade: {
          type: String,
          enum: ['O', 'A+', 'A', 'B+', 'B', 'C', 'P', 'F'],
          required: true,
        },
        gradePoints: {
          type: Number,
          required: true,
          min: 0,
          max: 10,
        },
      },
    ],
    sgpa: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    cgpa: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
  },
  {
    timestamps: true,
  }
);

// Enforce unique compound index to have only one record per student per semester
academicRecordSchema.index({ student: 1, semester: 1 }, { unique: true });

const AcademicRecord = mongoose.model('AcademicRecord', academicRecordSchema);
export default AcademicRecord;
