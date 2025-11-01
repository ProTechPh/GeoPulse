import User from '../models/User.js'

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin only)
export const getUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 20, search } = req.query

    const query = {}

    if (role) query.role = role

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await User.countDocuments(query)

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private (Admin only)
export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({
      success: true,
      data: user
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin only)
export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).select('-password')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({
      success: true,
      data: user
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Prevent deletion of last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' })
      if (adminCount === 1) {
        return res.status(400).json({ message: 'Cannot delete the last admin user' })
      }
    }

    await user.deleteOne()

    res.json({
      success: true,
      message: 'User deleted successfully'
    })
  } catch (error) {
    next(error)
  }
}
