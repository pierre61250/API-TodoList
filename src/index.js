import express from 'express';
import expressip from 'express-ip';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';
import { db } from './database/db.js';
import { colours } from './library/colors.js';

const app = express();

// Instantiation db object / Test Connection
const database = new db();

app.use(bodyParser.json());
app.use(express.static('../public'));
app.use(expressip().getIpInfoMiddleware);

function createError(errorMessage) {
    return {
        error: errorMessage,
    };
}

function parseEntryBody(requestBody) {
    let { content, limitDate, extraInfo } = requestBody;
    content = content ? content.toString() : null;
    limitDate = limitDate ? new Date(limitDate) : null;
    extraInfo = typeof(extraInfo) === 'undefined' ? null : extraInfo.toString();
    if (!content || !limitDate || isNaN(limitDate)) {
      throw new Error('Mauvais format ou contenu ou date limite manquante');
    }
    return { content, limitDate, extraInfo };
}

app.get('/todolist', (req, res) => {
    try {
        database.getTodoList()
        .then(data => {
            res.json(data.map(entry => ({id: entry._id, content: entry.content})));
            console.log(`${colours.fg.white}[${new Date().toLocaleTimeString()}] [${colours.fg.magenta}GET${colours.fg.white}] [${req.ipInfo.ip.split(":").pop() == 1 ? "127.0.0.1" : req.ipInfo.ip.split(":").pop()}] ${req.url}`);
        })
        .catch(err => {
            res.status(400).json(createError("Erreur lors de la communication avec la base de données"));
            console.log(`${colours.fg.white}[${new Date().toLocaleTimeString()}] [${colours.fg.magenta}GET${colours.fg.white}/${colours.fg.red}ERROR${colours.fg.white}] [${req.ipInfo.ip.split(":").pop() == 1 ? "127.0.0.1" : req.ipInfo.ip.split(":").pop()}] ${req.url} : ${err.message}`);
        });
    } catch (e) {
        res.status(400).json(createError(e.message));
        console.log(`${colours.fg.white}[${new Date().toLocaleTimeString()}] [${colours.fg.magenta}GET${colours.fg.white}/${colours.fg.red}ERROR${colours.fg.white}] [${req.ipInfo.ip.split(":").pop() == 1 ? "127.0.0.1" : req.ipInfo.ip.split(":").pop()}] ${req.url} : ${e.message}`);
    }
});

app.post('/todolist', (req, res) => {
    try {
        const { content, limitDate, extraInfo } = parseEntryBody(req.body);
        let todo = {
            _id: uuidv4(), 
            content, limitDate, extraInfo
        };
        database.postTodo(todo)
        .then(resp => {
            res.status(201).json(todo);
            console.log(`${colours.fg.white}[${new Date().toLocaleTimeString()}] [${colours.fg.cyan}POST${colours.fg.white}] [${req.ipInfo.ip.split(":").pop() == 1 ? "127.0.0.1" : req.ipInfo.ip.split(":").pop()}] ${req.url} (_id: ${todo._id})`);
        })
        .catch(err => {
            res.status(400).json(createError("Erreur lors de la communication avec la base de données"));
            console.log(`${colours.fg.white}[${new Date().toLocaleTimeString()}] [${colours.fg.cyan}POST${colours.fg.white}/${colours.fg.red}ERROR${colours.fg.white}] [${req.ipInfo.ip.split(":").pop() == 1 ? "127.0.0.1" : req.ipInfo.ip.split(":").pop()}] ${req.url} : ${err.message}`);
        });
    } catch (e) {
        res.status(400).json(createError(e.message));
        console.log(`${colours.fg.white}[${new Date().toLocaleTimeString()}] [${colours.fg.cyan}POST${colours.fg.white}/${colours.fg.red}ERROR${colours.fg.white}] [${req.ipInfo.ip.split(":").pop() == 1 ? "127.0.0.1" : req.ipInfo.ip.split(":").pop()}] ${req.url} : ${e.message}`);
    }
});

app.get('/todolist/:entryId', (req, res) => {
    try {
        const entryId = req.params.entryId;
        database.getTodo(entryId)
        .then(todo => {
            if (todo.length) {
                res.json(todo[0]);
                console.log(`${colours.fg.white}[${new Date().toLocaleTimeString()}] [${colours.fg.magenta}GET${colours.fg.white}] [${req.ipInfo.ip.split(":").pop() == 1 ? "127.0.0.1" : req.ipInfo.ip.split(":").pop()}] ${req.url}`);
            } else {
                res.status(404).json(createError("Aucun Todo n'est relié à cet id"));
                console.log(`${colours.fg.white}[${new Date().toLocaleTimeString()}] [${colours.fg.magenta}GET${colours.fg.white}/${colours.fg.red}ERROR${colours.fg.white}] [${req.ipInfo.ip.split(":").pop() == 1 ? "127.0.0.1" : req.ipInfo.ip.split(":").pop()}] ${req.url} : Aucun Todo n'est relié à cet id`);
            }
        })
        .catch((err) => {
            res.status(400).json(createError("Erreur lors de la communication avec la base de données"));
            console.log(`${colours.fg.white}[${new Date().toLocaleTimeString()}] [${colours.fg.magenta}GET${colours.fg.white}/${colours.fg.red}ERROR${colours.fg.white}] [${req.ipInfo.ip.split(":").pop() == 1 ? "127.0.0.1" : req.ipInfo.ip.split(":").pop()}] ${req.url} : ${err.message}`);
        });
    } catch (e) {
        res.status(400).json(createError(e.message));
        console.log(`${colours.fg.white}[${new Date().toLocaleTimeString()}] [${colours.fg.magenta}GET${colours.fg.white}/${colours.fg.red}ERROR${colours.fg.white}] [${req.ipInfo.ip.split(":").pop() == 1 ? "127.0.0.1" : req.ipInfo.ip.split(":").pop()}] ${req.url} : ${e.message}`);
    }
});

app.put('/todolist/:entryId', (req, res) => {
    try {
        const entryId = req.params.entryId;
        const { content, limitDate, extraInfo } = parseEntryBody(req.body);
        let todoUpdate = {
            _id: entryId,
            content, limitDate, extraInfo 
        }
        database.putTodo(todoUpdate)
        .then(response => {
            if (response.matchedCount) {
                res.json(todoUpdate);
                console.log(`${colours.fg.white}[${new Date().toLocaleTimeString()}] [${colours.fg.blue}PUT${colours.fg.white}] [${req.ipInfo.ip.split(":").pop() == 1 ? "127.0.0.1" : req.ipInfo.ip.split(":").pop()}] ${req.url}`);
            } else {
                res.status(404).json(createError("Aucun Todo n'est relié à cet id"));
                console.log(`${colours.fg.white}[${new Date().toLocaleTimeString()}] [${colours.fg.blue}PUT${colours.fg.white}/${colours.fg.red}ERROR${colours.fg.white}] [${req.ipInfo.ip.split(":").pop() == 1 ? "127.0.0.1" : req.ipInfo.ip.split(":").pop()}] ${req.url} : Aucun Todo n'est relié à cet id`);
            }
        })
        .catch(err => {
            res.status(400).json(createError("Erreur lors de la communication avec la base de données"));
            console.log(`${colours.fg.white}[${new Date().toLocaleTimeString()}] [${colours.fg.blue}PUT${colours.fg.white}/${colours.fg.red}ERROR${colours.fg.white}] [${req.ipInfo.ip.split(":").pop() == 1 ? "127.0.0.1" : req.ipInfo.ip.split(":").pop()}] ${req.url} : ${err.message}`);
        });
    } catch (e) {
        res.status(400).json(createError(e.message));
        console.log(`${colours.fg.white}[${new Date().toLocaleTimeString()}] [${colours.fg.blue}PUT${colours.fg.white}/${colours.fg.red}ERROR${colours.fg.white}] [${req.ipInfo.ip.split(":").pop() == 1 ? "127.0.0.1" : req.ipInfo.ip.split(":").pop()}] ${req.url} : ${e.message}`);
    }
});

app.delete('/todolist/:entryId', (req, res) => {
    try {
        const entryId = req.params.entryId;
        database.deleteTodo(entryId)
        .then(response => {
            if (response.deletedCount == 0) {
                res.status(404).json(createError("Aucun Todo n'est relié à cet id"));
                console.log(`${colours.fg.white}[${new Date().toLocaleTimeString()}] [${colours.fg.yellow}DELETE${colours.fg.white}/${colours.fg.red}ERROR${colours.fg.white}] [${req.ipInfo.ip.split(":").pop() == 1 ? "127.0.0.1" : req.ipInfo.ip.split(":").pop()}] ${req.url} : Aucun Todo n'est relié à cet id`);
            } else {
                res.status(204).end();
                console.log(`${colours.fg.white}[${new Date().toLocaleTimeString()}] [${colours.fg.yellow}DELETE${colours.fg.white}] [${req.ipInfo.ip.split(":").pop() == 1 ? "127.0.0.1" : req.ipInfo.ip.split(":").pop()}] ${req.url}`);
            }
        })
        .catch(err => {
            res.status(400).json(createError("Erreur lors de la communication avec la base de données"));
            console.log(`${colours.fg.white}[${new Date().toLocaleTimeString()}] [${colours.fg.yellow}DELETE${colours.fg.white}/${colours.fg.red}ERROR${colours.fg.white}] [${req.ipInfo.ip.split(":").pop() == 1 ? "127.0.0.1" : req.ipInfo.ip.split(":").pop()}] ${req.url} : ${err.message}`);
        });
    } catch (e) {
        res.status(400).json(createError(e.message));
        console.log(`${colours.fg.white}[${new Date().toLocaleTimeString()}] [${colours.fg.yellow}DELETE${colours.fg.white}/${colours.fg.red}ERROR${colours.fg.white}] [${req.ipInfo.ip.split(":").pop() == 1 ? "127.0.0.1" : req.ipInfo.ip.split(":").pop()}] ${req.url} : ${e.message}`);
    }
});

app.listen(5000);

console.log(`${colours.fg.white}[${new Date().toLocaleTimeString()}] [INFO] API start on ${colours.fg.blue}http://127.0.0.1:5000${colours.fg.white}`);