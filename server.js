import express from 'express';
import cors from 'cors';
import routes from './server/routes.js';
const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('client'));
///Routes///
routes(app);
const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server running at port ${port}`));
//# sourceMappingURL=server.js.map