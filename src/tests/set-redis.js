import 'dotenv/config';
import redis   from '../lib/redis.js';
const data = {
    "name": "John Doe",
    "email": "",
    "age": 30
}
redis.set("set_test", JSON.stringify(data), "EX", 60);
