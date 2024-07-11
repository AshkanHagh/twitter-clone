import './configs/cloudinary.config';
import { app } from './app';

const PORT = process.env.PORT || 2338;

app.listen(PORT, () => console.log(`Started server http://localhost:${PORT}`));