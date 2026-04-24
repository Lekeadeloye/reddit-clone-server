import  express  from "express";
import type { Request, Response, NextFunction } from "express";

const postsRouter = express.Router();


interface RedditPost {
  [key: string]: any;
}

interface RedditChild {
  data: RedditPost;
}

postsRouter.get('/', async (req, res, next) => {
  try {
    const sort = (req.query.sort as string) || 'best';
    const validSorts = ['all', 'best', 'hot', 'new', 'top'];
    const safeSort = validSorts.includes(sort) ? sort : 'all';

    const url = safeSort === 'all' ? 'https://www.reddit.com/r/all/hot.json' : `https://www.reddit.com/r/all/${safeSort}.json`

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'MyRedditApp/1.0.0 (by /u/LekeAdeloye)'
      },
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json();
    const posts: RedditPost[] = data.data.children.map((child: RedditChild) => child.data)
    const after = data.data.after;
    const before = data.data.before;

    const dataToSend = {
      after,
      posts,
      before
    }
    // Send data to client
    console.log(req.query)
    res.status(200).json(dataToSend) 

  } catch (error) {
    console.error('Failed to fetch posts', error)
    res.status(500).json({message: 'Something went wrong'})
  }
})

export default postsRouter