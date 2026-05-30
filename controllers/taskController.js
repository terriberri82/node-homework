const { StatusCodes } = require("http-status-codes");
const { taskSchema, patchTaskSchema } = require("../validation/taskSchema");
const prisma = require("../db/prisma")


async function create(req, res) {
  if (!req.body) req.body = {};
   const {error, value} = taskSchema.validate(req.body, {abortEarly: false});
  if (error){
    return res.status(StatusCodes.BAD_REQUEST).json({message:error.message})
  }  
 const task = await prisma.task.create({
    data: { title: value.title, isCompleted: value.isCompleted, userId: global.user_id },
    select: { title: true, isCompleted: true, id: true} 
  });
  res.status(StatusCodes.CREATED).json(task);
}


async function index(req, res) {
  const tasks = await prisma.task.findMany({
  where: {
    userId: global.user_id, // only the tasks for this user!
  },
  select: { title: true, isCompleted: true, id: true }
});
  if (tasks.length === 0) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: "No tasks found" });
  }
  res.status(StatusCodes.OK).json(tasks);
}

async function show(req, res, next) {
  const id = parseInt(req.params.id);
try {
  const showTask = await prisma.task.findUnique({
    where: { userId: global.user_id, id:id },
    select: { title: true, isCompleted: true, id: true} 
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
    select: { title: true, isCompleted: true, id: true }
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
    select: { title: true, isCompleted: true, id: true }
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


module.exports = { create, index, show, update, deleteTask };
