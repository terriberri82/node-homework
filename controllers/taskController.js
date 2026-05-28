const { StatusCodes } = require("http-status-codes");
const { taskSchema, patchTaskSchema } = require("../validation/taskSchema");
const paginationSchema = require("../validation/paginationSchema");
const prisma = require("../db/prisma")
 

async function create(req, res) {
  if (!req.body) req.body = {};
   const {error, value} = taskSchema.validate(req.body, {abortEarly: false});
  if (error){
    return res.status(StatusCodes.BAD_REQUEST).json({message:error.message})
  }  
 const task = await prisma.task.create({
    data: { title: value.title, isCompleted: value.isCompleted, priority: value.priority, userId: global.user_id },
    select: { title: true, isCompleted: true, id: true, priority: true, createdAt: true } 
  });
  res.status(StatusCodes.CREATED).json(task);
}


async function index(req, res) {
   const {error, value} = paginationSchema.validate(req.query, {abortEarly: false});
  if (error){
    return res.status(StatusCodes.BAD_REQUEST).json({message:error.message})
  } 

  // Parse pagination parameters
const page = value.page || 1;
const limit = value.limit || 10;
const skip = (page - 1) * limit;

const whereClause = { userId: global.user_id };
if (req.query.find) {
  whereClause.title = {
    contains: req.query.find,        // Matches %find% pattern
    mode: 'insensitive'              // Case-insensitive search (ILIKE in PostgreSQL)
  };
}

const tasks = await prisma.task.findMany({
  where: whereClause,
  select: { title: true, isCompleted: true, id: true, priority: true, createdAt: true,  User: {
      select: {
        name: true,
        email: true
      }
    }},
   skip: skip,
  take: limit,
  orderBy: { createdAt: 'desc' } 
});
  // Get total count for pagination metadata
const totalTasks = await prisma.task.count({
  where: whereClause
});
const pagination = {
  page,
  limit,
  total: totalTasks,
  pages: Math.ceil(totalTasks / limit),
  hasNext: page * limit < totalTasks,
  hasPrev: page > 1
};

  res.status(StatusCodes.OK).json({tasks, pagination});
}

async function show(req, res, next) {
  const id = parseInt(req.params.id);
try {
  const showTask = await prisma.task.findUnique({
    where: { userId: global.user_id, id:id },
    select: { title: true, isCompleted: true, id: true, priority: true, createdAt: true, User: {
      select: {
        name: true,
        email: true
      }
    }} 
  });
  return res.status(StatusCodes.OK).json(showTask);
} catch (err) {
  if (err.code === "P2025" ) {
    return res.status(404).json({ message: "The task was not found."})
  } else {
    return next(err); 
  }
}
}


async function update(req, res, next) {
      if (!req.body) req.body = {};
   const {error, value} = patchTaskSchema.validate(req.body, {abortEarly: false});
  if (error){
    return res.status(StatusCodes.BAD_REQUEST).json({message:error.message})
  }  

const id = parseInt(req.params.id);
try {
  const task = await prisma.task.update({
    data: value,
    where: {
      id,
      userId: global.user_id,
    },
    select: { title: true, isCompleted: true, id: true, priority: true, createdAt: true  }
  });
  return res.status(StatusCodes.OK).json(task);
} catch (err) {
  if (err.code === "P2025" ) {
    return res.status(404).json({ message: "The task was not found."})
  } else {
    return next(err); 
  }
}
}

async function deleteTask(req, res, next) {
 const id = parseInt(req.params.id);
try {
   const deletedTask = await prisma.task.delete({
    where: {
      id,
      userId: global.user_id,
    },
    select: { title: true, isCompleted: true, id: true, priority: true, createdAt: true  }
  });
  return res.status(StatusCodes.OK).json(deletedTask);
} catch (err) {
  if (err.code === "P2025" ) {
    return res.status(404).json({ message: "The task was not found."})
  } else {
    return next(err); 
  }
}
}

async function bulkCreate (req, res, next){
const { tasks } = req.body;

  // Validate the tasks array
  if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
    return res.status(400).json({ 
      error: "Invalid request data. Expected an array of tasks." 
    });
  }

  // Validate all tasks before insertion
  const validTasks = [];
  for (const task of tasks) {
    const { error, value } = taskSchema.validate(task);
    if (error) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.details,
      });
    }
    validTasks.push({
      title: value.title,
      isCompleted: value.isCompleted || false,
      priority: value.priority || 'medium',
      userId: global.user_id
    });
  }

  // Use createMany for batch insertion
  try {
    const result = await prisma.task.createMany({
      data: validTasks,
      skipDuplicates: false
    });

    res.status(201).json({
      message: "success!",
      tasksCreated: result.count,
      totalRequested: validTasks.length
    });
  } catch (err) {
    return next(err);
  }
}



module.exports = { create, index, show, update, deleteTask, bulkCreate };
