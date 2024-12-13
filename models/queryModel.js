import db from '../config/dbConfig.js';

// Create the `queries` table if it doesn't exist
const createQueryTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS queries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      query_type VARCHAR(455) NOT NULL,
      description TEXT NOT NULL,
      status ENUM('new', 'in_progress', 'resolved') DEFAULT 'new',
      amount DECIMAL(10, 2) DEFAULT NULL,
      payment_link VARCHAR(2083) DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `;
  db.query(sql, (err) => {
    if (err) {
      console.error('Error creating queries table:', err.message);
    } else {
      console.log('Queries table ensured.');
    }
  });
};
createQueryTable();

// Add a new query to the database

export const addQuery = (user_id, title, query_type, description, amount = null, payment_link = null) => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO queries (user_id, title, query_type, description, amount, payment_link) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    if (!query_type || query_type.trim() === '') {
      console.error('Query type is required');
      return;
    }
    const validQueryTypes = ['technical', 'service', 'other']; // Adjust the list based on your expected types
    if (!validQueryTypes.includes(query_type)) {
      console.error('Invalid query_type:', query_type);
      return; // Or handle the error appropriately
    }
    db.query(sql, [user_id, title, query_type, description, amount, payment_link], (err, result) => {
      if (err) {
        console.error('Database error:', err); // Log database error
        reject(err);
      } else {
        resolve(result.insertId);
      }
    });
  });
};



// Get all queries for a specific user (with optional amount and payment_link)
export const getUserQueries = (user_id) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT id, title, query_type, description, status, created_at, amount, payment_link 
      FROM queries 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `;
    db.query(sql, [user_id], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};


// Get all queries for a user by status
// Get all queries for a user by status
export const getUserQueriesByStatus = (user_id, status) => {
  return new Promise((resolve, reject) => {
    let sql = `
      SELECT id, title, query_type, description, status, created_at
    `;

    // Include `amount` and `payment_link` for 'in_progress' or 'resolved' statuses
    if (['in_progress', 'resolved'].includes(status)) {
      sql += `, amount, payment_link `;
    }

    sql += `
      FROM queries 
      WHERE user_id = ? AND status = ? 
      ORDER BY created_at DESC
    `;

    db.query(sql, [user_id, status], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};


// Get all queries (Admin view)
// Get all queries (Admin view)
export const getAllQueries = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT q.id, q.title, q.query_type, q.description, q.status, q.created_at, 
        u.name, u.email,
        q.amount,   -- Always include amount
        q.payment_link  -- Always include payment_link
      FROM queries q 
      JOIN users u ON q.user_id = u.id 
      ORDER BY q.created_at DESC
    `;

    db.query(sql, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};


// Get all queries by status (Admin view)
export const getAllQueriesByStatus = (status) => {
  return new Promise((resolve, reject) => {
    let sql = `
      SELECT q.id, q.title, q.query_type, q.description, q.status, q.created_at, 
        u.name, u.email
    `;

    // Include `amount` and `payment_link` for 'in_progress' or 'resolved' statuses
    if (['in_progress', 'resolved'].includes(status)) {
      sql += `, q.amount, q.payment_link `;
    }

    sql += `
      FROM queries q 
      JOIN users u ON q.user_id = u.id 
      WHERE q.status = ? 
      ORDER BY q.created_at DESC
    `;
    db.query(sql, [status], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};


// Update the status of a query by id
export const updateQueryStatus = (queryId, status, amount = null, payment_link = null) => {
  return new Promise((resolve, reject) => {
    let sql, params;

    console.log('updateQueryStatus called with:', { queryId, status, amount, payment_link });

    if (status === 'in_progress') {
      // Include amount and payment_link when status is 'in_progress'
      sql = `
        UPDATE queries
        SET status = ?, amount = ?, payment_link = ?
        WHERE id = ?
      `;
      params = [status, amount, payment_link, queryId];
    } else {
      // Only update the status when it's not 'in_progress'
      sql = `
        UPDATE queries
        SET status = ?
        WHERE id = ?
      `;
      params = [status, queryId];
    }

    console.log('SQL Query:', sql);
    console.log('Parameters:', params);

    db.query(sql, params, (err, result) => {
      if (err) {
        console.error('Error executing query:', err);
        reject(err);
      } else {
        console.log('Query executed successfully. Result:', result);
        resolve(result);
      }
    });
  });
};
