import Notice from '../models/Notice.js';

// @desc    Create a new notice
// @route   POST /api/notices
// @access  Private (Admin, Faculty)
export const createNotice = async (req, res) => {
  const { title, content, targetRoles } = req.body;

  try {
    const notice = await Notice.create({
      title,
      content,
      author: req.user._id,
      targetRoles: targetRoles || ['student', 'faculty'],
    });

    const populatedNotice = await Notice.findById(notice._id).populate('author', 'name role');

    res.status(201).json(populatedNotice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get notices visible to the user's role
// @route   GET /api/notices
// @access  Private (All roles)
export const getNotices = async (req, res) => {
  try {
    // Return notices that match the user's role in targetRoles
    const notices = await Notice.find({ targetRoles: req.user.role })
      .populate('author', 'name role')
      .sort({ createdAt: -1 });

    res.status(200).json(notices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a notice
// @route   DELETE /api/notices/:id
// @access  Private (Admin, Faculty)
export const deleteNotice = async (req, res) => {
  const { id } = req.params;

  try {
    const notice = await Notice.findById(id);

    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    // Verify if author or admin
    if (notice.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized notice deletion' });
    }

    await Notice.deleteOne({ _id: id });
    res.status(200).json({ message: 'Notice deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
