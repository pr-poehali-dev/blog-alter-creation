"""
Business: Blog posts management and Instagram-like stories - create, read, update, track views
Args: event with httpMethod, body, queryStringParameters; context with request_id
Returns: HTTP response with post/story data or list
"""

import json
import os
from typing import Dict, Any, List
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn, cursor_factory=RealDictCursor)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        if method == 'GET':
            params = event.get('queryStringParameters', {}) or {}
            post_id = params.get('id')
            post_type = params.get('type')
            user_id = params.get('user_id')
            limit = int(params.get('limit', '20'))
            stories_mode = params.get('stories')
            
            if stories_mode:
                if user_id:
                    cur.execute("""
                        SELECT s.*, u.username, u.full_name, u.avatar_url,
                               COALESCE(
                                   json_agg(
                                       json_build_object('viewer_id', sv.viewer_id, 'viewed_at', sv.viewed_at)
                                   ) FILTER (WHERE sv.id IS NOT NULL),
                                   '[]'::json
                               ) as views
                        FROM stories s
                        JOIN users u ON s.user_id = u.id
                        LEFT JOIN story_views sv ON s.id = sv.story_id
                        WHERE s.user_id = %s AND s.expires_at > NOW()
                        GROUP BY s.id, u.id
                        ORDER BY s.created_at DESC
                    """, (user_id,))
                else:
                    cur.execute("""
                        SELECT DISTINCT ON (s.user_id) 
                               s.*, u.username, u.full_name, u.avatar_url,
                               (SELECT COUNT(*) FROM stories WHERE user_id = s.user_id AND expires_at > NOW()) as story_count,
                               (SELECT COUNT(*) FROM story_views WHERE story_id = s.id) as view_count
                        FROM stories s
                        JOIN users u ON s.user_id = u.id
                        WHERE s.expires_at > NOW()
                        ORDER BY s.user_id, s.created_at DESC
                    """)
                
                stories = [dict(row) for row in cur.fetchall()]
                cur.close()
                conn.close()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(stories, default=str),
                    'isBase64Encoded': False
                }
            
            if post_id:
                cur.execute(
                    """SELECT p.*, u.username, u.full_name, u.avatar_url,
                       (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
                       (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count
                       FROM posts p 
                       JOIN users u ON p.user_id = u.id 
                       WHERE p.id = %s""",
                    (post_id,)
                )
                post = cur.fetchone()
                
                if not post:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Post not found'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute("UPDATE posts SET views = views + 1 WHERE id = %s", (post_id,))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(dict(post), default=str),
                    'isBase64Encoded': False
                }
            
            query = """SELECT p.*, u.username, u.full_name, u.avatar_url,
                       (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
                       (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count
                       FROM posts p 
                       JOIN users u ON p.user_id = u.id 
                       WHERE p.published = true"""
            
            params_list = []
            
            if post_type:
                query += " AND p.post_type = %s"
                params_list.append(post_type)
            
            if user_id:
                query += " AND p.user_id = %s"
                params_list.append(user_id)
            
            query += " ORDER BY p.created_at DESC LIMIT %s"
            params_list.append(limit)
            
            cur.execute(query, tuple(params_list))
            posts = [dict(row) for row in cur.fetchall()]
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(posts, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action', 'create_post')
            
            if action == 'create_story':
                user_id = body_data.get('user_id')
                image_url = body_data.get('image_url')
                
                cur.execute("""
                    INSERT INTO stories (user_id, image_url)
                    VALUES (%s, %s)
                    RETURNING id, user_id, image_url, created_at, expires_at
                """, (user_id, image_url))
                
                story = dict(cur.fetchone())
                conn.commit()
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 201,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(story, default=str),
                    'isBase64Encoded': False
                }
            
            elif action == 'view_story':
                story_id = body_data.get('story_id')
                viewer_id = body_data.get('viewer_id')
                
                cur.execute("""
                    INSERT INTO story_views (story_id, viewer_id)
                    VALUES (%s, %s)
                    ON CONFLICT (story_id, viewer_id) DO NOTHING
                    RETURNING id
                """, (story_id, viewer_id))
                
                conn.commit()
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True}),
                    'isBase64Encoded': False
                }
            
            elif action == 'delete_story':
                story_id = body_data.get('story_id')
                user_id = body_data.get('user_id')
                
                cur.execute("""
                    SELECT user_id FROM stories WHERE id = %s
                """, (story_id,))
                story = cur.fetchone()
                
                if not story:
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Story not found'}),
                        'isBase64Encoded': False
                    }
                
                if story['user_id'] != user_id:
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 403,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Not authorized'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute("UPDATE stories SET expires_at = NOW() WHERE id = %s", (story_id,))
                conn.commit()
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True}),
                    'isBase64Encoded': False
                }
            
            user_id = body_data.get('user_id')
            title = body_data.get('title')
            content = body_data.get('content')
            excerpt = body_data.get('excerpt', '')
            cover_image_url = body_data.get('cover_image_url', '')
            post_type = body_data.get('post_type', 'blog')
            category = body_data.get('category', '')
            tags = body_data.get('tags', [])
            published = body_data.get('published', True)
            
            if not all([user_id, title, content]):
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Missing required fields'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                """INSERT INTO posts (user_id, title, content, excerpt, cover_image_url, post_type, category, tags, published)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                   RETURNING id, title, created_at""",
                (user_id, title, content, excerpt, cover_image_url, post_type, category, tags, published)
            )
            post = dict(cur.fetchone())
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(post, default=str),
                'isBase64Encoded': False
            }
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }