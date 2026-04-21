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
    const response = await fetch('https://www.reddit.com/r/all.json', {
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
    const myVersionOfPosts = posts.map((post) => {
      return {
        id: post.id,
        title: post.title,
        author: post.author,
        commentCount: post.num_comments
      }
    })
    // Send data to client
    res.status(200).json(data) 

  } catch (error) {
    console.error('Failed to fetch posts', error)
    res.status(500).json({message: 'Something went wrong'})
  }
})

export default postsRouter