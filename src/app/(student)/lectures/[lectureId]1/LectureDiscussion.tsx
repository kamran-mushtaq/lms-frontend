'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  _id: string;
  userId: {
    _id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  createdAt: string;
  updatedAt: string;
  replies?: Comment[];
}

interface LectureDiscussionProps {
  lectureId: string;
}

// This would be replaced with actual API calls
const fetchComments = async (lectureId: string): Promise<Comment[]> => {
  // Simulating API call
  console.log(`Fetching comments for lecture: ${lectureId}`);
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock data
  return [
    {
      _id: '1',
      userId: {
        _id: 'user1',
        name: 'John Doe',
        avatar: ''
      },
      content: 'This lecture was very informative, especially the part about the key concepts!',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      _id: '2',
      userId: {
        _id: 'user2',
        name: 'Jane Smith',
        avatar: ''
      },
      content: 'I had a question about the example used at around the 12:30 mark. Could someone clarify how that applies in real-world scenarios?',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      replies: [
        {
          _id: '2-1',
          userId: {
            _id: 'user3',
            name: 'Robert Johnson',
            avatar: ''
          },
          content: 'The example at 12:30 is demonstrating how the principle can be applied in a simplified context. In real-world scenarios, you would need to consider additional factors like resource constraints and stakeholder requirements.',
          createdAt: new Date(Date.now() - 43200000).toISOString(),
          updatedAt: new Date(Date.now() - 43200000).toISOString()
        }
      ]
    }
  ];
};

// This would be replaced with actual API calls
const postComment = async (lectureId: string, content: string): Promise<Comment> => {
  // Simulating API call
  console.log(`Posting comment for lecture: ${lectureId}`);
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock response
  return {
    _id: Math.random().toString(36).substring(7),
    userId: {
      _id: 'currentUser',
      name: 'Current User',
      avatar: ''
    },
    content,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

export default function LectureDiscussion({ lectureId }: LectureDiscussionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadComments = async () => {
      setLoading(true);
      try {
        const data = await fetchComments(lectureId);
        setComments(data);
      } catch (error) {
        console.error('Error fetching comments:', error);
      } finally {
        setLoading(false);
      }
    };

    loadComments();
  }, [lectureId]);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const postedComment = await postComment(lectureId, newComment);
      setComments([postedComment, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Get initials from name for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Discussion</h2>
        
        {/* Add comment form */}
        <div className="space-y-2">
          <Textarea
            placeholder="Add to the discussion..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex justify-end">
            <Button 
              onClick={handleSubmitComment} 
              disabled={submitting || !newComment.trim()}
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
        </div>

        {/* Comments list */}
        <div className="space-y-6 mt-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No comments yet. Be the first to start the discussion!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment._id} className="space-y-4">
                <div className="flex gap-4">
                  <Avatar className="h-10 w-10">
                    {comment.userId.avatar ? (
                      <AvatarImage src={comment.userId.avatar} />
                    ) : (
                      <AvatarFallback>{getInitials(comment.userId.name)}</AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{comment.userId.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                </div>

                {/* Comment replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="pl-14 space-y-4">
                    {comment.replies.map((reply) => (
                      <div key={reply._id} className="flex gap-4">
                        <Avatar className="h-8 w-8">
                          {reply.userId.avatar ? (
                            <AvatarImage src={reply.userId.avatar} />
                          ) : (
                            <AvatarFallback>{getInitials(reply.userId.name)}</AvatarFallback>
                          )}
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{reply.userId.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-sm">{reply.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}