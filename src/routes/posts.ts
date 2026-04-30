import express from "express";
import type { Request, Response, NextFunction } from "express";

const postsRouter = express.Router();

interface RedditPost {
  [key: string]: any;
}

interface RedditChild {
  data: RedditPost;
}

postsRouter.get("/", async (req, res, next) => {
  try {
    const sort = (req.query.sort as string) || "best";
    const validSorts = ["all", "best", "hot", "new", "top"];
    const safeSort = validSorts.includes(sort) ? sort : "all";

    const url =
      safeSort === "all"
        ? "https://www.reddit.com/r/all/hot.json"
        : `https://www.reddit.com/r/all/${safeSort}.json`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "MyRedditApp/1.0.0 (by /u/LekeAdeloye)",
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const posts: RedditPost[] = data.data.children.map(
      (child: RedditChild) => child.data,
    );
    const after = data.data.after;
    const before = data.data.before;

    const dataToSend = {
      after,
      posts,
      before,
    };
    // Send data to client
    console.log(req.query);
    res.status(200).json(dataToSend);
  } catch (error) {
    console.error("Failed to fetch posts", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

postsRouter.get("/r/:subReddit", async (req, res, next) => {
  try {
    const {subReddit: subreddit} = req.params;
    const url = `https://www.reddit.com/r/${subreddit}.json`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "MyRedditApp/1.0.0 (by /u/LekeAdeloye)",
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.log('Failed to fetch sub-reddit posts', error)
    res.status(500).json({message: 'Something went wrong'})
  }
});
postsRouter.get("/r/:subReddit/:postId", async (req, res, next) => {
  try {
    // const subreddit = (req.query.subreddit as string);
    // const postId = (req.query.id as string)
    const {subReddit: subreddit, postId} = req.params
    console.log(subreddit, postId)
    const url = `https://www.reddit.com/r/${subreddit}/comments/${postId}.json`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "MyRedditApp/1.0.0 (by /u/LekeAdeloye)",
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json();
    const post = data?.[0]?.data?.children?.[0]?.data
    const comments = data?.[1]?.data?.children ?? []

    // console.log('post:', post, comments)
    console.log(data)


    if (!post) {
      return res.status(404).json({message: 'Post not found'})
    }
    res.status(200).json({post, comments});
    // res.status(200).json(data);

  } catch (error) {
    console.log('Failed to fetch sub-reddit posts', error)
  }
});

export default postsRouter;
