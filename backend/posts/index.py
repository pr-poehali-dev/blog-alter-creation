"""
Business: Blog posts management - create, read, update posts and stories
Args: event with httpMethod, body, queryStringParameters; context with request_id
Returns: HTTP response with post data or list of posts
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
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
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
