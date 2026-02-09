const pool = require('../config/database');

class Guideline {
  // Get all guidelines
  static async getAll() {
    const result = await pool.query(
      'SELECT * FROM guidelines WHERE is_active = TRUE ORDER BY created_at DESC'
    );
    return result.rows;
  }

  // Get guideline by ID
  static async getById(id) {
    const result = await pool.query(
      'SELECT * FROM guidelines WHERE id = $1 AND is_active = TRUE',
      [id]
    );
    return result.rows[0];
  }

  // Get guidelines by category
  static async getByCategory(category) {
    const result = await pool.query(
      'SELECT * FROM guidelines WHERE category = $1 AND is_active = TRUE ORDER BY created_at DESC',
      [category]
    );
    return result.rows;
  }

  // Create new guideline
  static async create(guidelineData) {
    const { title, content, category, created_by } = guidelineData;
    const result = await pool.query(
      'INSERT INTO guidelines (title, content, category, created_by) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, content, category, created_by]
    );
    return result.rows[0];
  }

  // Update guideline
  static async update(id, guidelineData) {
    const { title, content, category } = guidelineData;
    const result = await pool.query(
      'UPDATE guidelines SET title = $1, content = $2, category = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 AND is_active = TRUE RETURNING *',
      [title, content, category, id]
    );
    return result.rows[0];
  }

  // Soft delete guideline
  static async delete(id) {
    const result = await pool.query(
      'UPDATE guidelines SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }
}

module.exports = Guideline;
