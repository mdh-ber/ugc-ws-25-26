const Guideline = require('../models/Guideline');

class GuidelineController {
  // Get all guidelines
  static async getAllGuidelines(req, res) {
    try {
      const guidelines = await Guideline.getAll();
      res.status(200).json({
        success: true,
        data: guidelines
      });
    } catch (error) {
      console.error('Error getting guidelines:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch guidelines',
        error: error.message
      });
    }
  }

  // Get guideline by ID
  static async getGuidelineById(req, res) {
    try {
      const { id } = req.params;
      const guideline = await Guideline.getById(id);
      
      if (!guideline) {
        return res.status(404).json({
          success: false,
          message: 'Guideline not found'
        });
      }

      res.status(200).json({
        success: true,
        data: guideline
      });
    } catch (error) {
      console.error('Error getting guideline:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch guideline',
        error: error.message
      });
    }
  }

  // Get guidelines by category
  static async getGuidelinesByCategory(req, res) {
    try {
      const { category } = req.params;
      const guidelines = await Guideline.getByCategory(category);
      
      res.status(200).json({
        success: true,
        data: guidelines
      });
    } catch (error) {
      console.error('Error getting guidelines by category:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch guidelines by category',
        error: error.message
      });
    }
  }

  // Create new guideline
  static async createGuideline(req, res) {
    try {
      const { title, content, category, created_by } = req.body;

      if (!title || !content) {
        return res.status(400).json({
          success: false,
          message: 'Title and content are required'
        });
      }

      const guideline = await Guideline.create({
        title,
        content,
        category,
        created_by
      });

      res.status(201).json({
        success: true,
        message: 'Guideline created successfully',
        data: guideline
      });
    } catch (error) {
      console.error('Error creating guideline:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create guideline',
        error: error.message
      });
    }
  }

  // Update guideline
  static async updateGuideline(req, res) {
    try {
      const { id } = req.params;
      const { title, content, category } = req.body;

      if (!title || !content) {
        return res.status(400).json({
          success: false,
          message: 'Title and content are required'
        });
      }

      const guideline = await Guideline.update(id, {
        title,
        content,
        category
      });

      if (!guideline) {
        return res.status(404).json({
          success: false,
          message: 'Guideline not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Guideline updated successfully',
        data: guideline
      });
    } catch (error) {
      console.error('Error updating guideline:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update guideline',
        error: error.message
      });
    }
  }

  // Delete guideline
  static async deleteGuideline(req, res) {
    try {
      const { id } = req.params;
      const guideline = await Guideline.delete(id);

      if (!guideline) {
        return res.status(404).json({
          success: false,
          message: 'Guideline not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Guideline deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting guideline:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete guideline',
        error: error.message
      });
    }
  }
}

module.exports = GuidelineController;
