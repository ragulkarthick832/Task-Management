const express = require("express")
const cors = require("cors")
const app = express()

app.use(cors())
app.use(express.json())


let tasks = []
// get all task
app.get("/api/tasks",(req,res)=>{
    console.log(tasks)
    res.json(tasks)
})

// post new task
app.post("/api/tasks",(req,res)=>{
    const newTask = {id: Date.now().toString(),text: req.body.text,completed:false}
    tasks.push(newTask)
    console.log(tasks)
    res.json(newTask)
})

// put update task
app.put("/api/tasks/:id",(req,res)=>{
    const {id} = req.params
    const {text} = req.body
    tasks = tasks.map(t => (t.id === id? {...t,text}:t))
    res.json({success:true})
})

// patch toggle 
app.patch("/api/tasks/:id",(req,res)=>{
    const {id} = req.params
    const {completed} = req.body
    tasks = tasks.map(t => (t.id === id ? {...t,completed}: t))
    res.json({success:true})
});

// delete task
app.delete("/api/tasks/:id",(req,res)=>{
    const {id}= req.params
    task = tasks.filter(t => t.id == id)
    res.json({success:true})
})
app.listen(5000,()=>{
    console.log("Server is running on port 5000")
    }
)