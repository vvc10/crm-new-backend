import { addQuery, getUserQueries, getAllQueries, getUserQueriesByStatus, getAllQueriesByStatus,updateQueryStatus } from '../models/queryModel.js';

// Create a new query
export const createQuery = async (req, res) => {
  const userId = req.user.id; // Extracted from the JWT token
  const { query_details } = req.body;

  if (!query_details) {
    return res.status(400).send('Query details are required.');
  }

  try {
    // Ensure that user_id is not null
    if (!userId) {
      return res.status(400).send('User ID is required.');
    }

    const queryId = await addQuery(userId, query_details);
    res.status(201).send({
      message: 'Query created successfully.',
      queryId,
    });
  } catch (err) {
    console.error('Error creating query:', err.message);
    res.status(500).send('Error creating query.');
  }
};

// Get all queries for the logged-in user
export const fetchUserQueries = async (req, res) => {
  const userId = req.user.id; // Extracted from the JWT token

  try {
    const queries = await getUserQueries(userId);
    res.status(200).json(queries);
  } catch (err) {
    console.error('Error fetching user queries:', err.message);
    res.status(500).send('Error fetching queries.');
  }
};

// Get all queries (Admin view)
export const fetchAllQueries = async (req, res) => {
  try {
    const queries = await getAllQueries();
    res.status(200).json(queries);
  } catch (err) {
    console.error('Error fetching all queries:', err.message);
    res.status(500).send('Error fetching queries.');
  }
};

// Fetch user queries by status
export const fetchUserQueriesByStatus = async (req, res) => {
  const userId = req.user.id; // Extracted from the JWT token
  const { status } = req.params;

  try {
    const validStatuses = ['new', 'in_progress', 'resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).send('Invalid query status.');
    }

    const queries = await getUserQueriesByStatus(userId, status);
    res.status(200).json(queries);
  } catch (err) {
    console.error(`Error fetching user queries with status ${status}:`, err.message);
    res.status(500).send('Error fetching queries.');
  }
};

// Fetch all queries by status (Admin view)
export const fetchAllQueriesByStatus = async (req, res) => {
  const { status } = req.params;

  try {
    const validStatuses = ['new', 'in_progress', 'resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).send('Invalid query status.');
    }

    const queries = await getAllQueriesByStatus(status);
    res.status(200).json(queries);
  } catch (err) {
    console.error(`Error fetching all queries with status ${status}:`, err.message);
    res.status(500).send('Error fetching queries.');
  }
};


// Admin: Update the status of a query
export const updateQueryStatusByAdmin = async (req, res) => {
  const { queryId, status } = req.body;

  console.log('Received status:', status); // Log the status value

  const validStatuses = ['new', 'in_progress', 'resolved'];
  if (!validStatuses.includes(status)) {
    return res.status(400).send('Invalid status. Valid statuses are: new, in_progress, resolved.');
  }

  try {
    const result = await updateQueryStatus(queryId, status);
    if (result.affectedRows > 0) {
      res.status(200).send('Query status updated successfully.');
    } else {
      res.status(404).send('Query not found.');
    }
  } catch (err) {
    console.error('Error updating query status:', err.message);
    res.status(500).send('Error updating query status.');
  }
};