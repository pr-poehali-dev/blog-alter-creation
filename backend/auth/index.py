"""
Business: User authentication system - registration, login, profile management
Args: event with httpMethod, body, queryStringParameters; context with request_id
Returns: HTTP response with JWT token or user data
"""

import json
import os
import hashlib
import secrets
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import RealDictCursor

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def generate_token() -> str:
    return secrets.token_urlsafe(32)

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
        
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            
            if action == 'register':
                email = body_data.get('email')
                username = body_data.get('username')
                password = body_data.get('password')
                full_name = body_data.get('full_name', '')
                
                if not all([email, username, password]):
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Missing required fields'}),
                        'isBase64Encoded': False
                    }
                
                password_hash = hash_password(password)
                
                cur.execute(
                    "INSERT INTO users (email, username, password_hash, full_name) VALUES (%s, %s, %s, %s) RETURNING id, email, username, full_name, created_at",
                    (email, username, password_hash, full_name)
                )
                user = dict(cur.fetchone())
                conn.commit()
                
                token = generate_token()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'token': token,
                        'user': {
                            'id': user['id'],
                            'email': user['email'],
                            'username': user['username'],
                            'full_name': user['full_name']
                        }
                    }, default=str),
                    'isBase64Encoded': False
                }
            
            elif action == 'login':
                email = body_data.get('email')
                password = body_data.get('password')
                
                if not all([email, password]):
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Missing required fields'}),
                        'isBase64Encoded': False
                    }
                
                password_hash = hash_password(password)
                
                cur.execute(
                    "SELECT id, email, username, full_name, bio, avatar_url FROM users WHERE email = %s AND password_hash = %s",
                    (email, password_hash)
                )
                user = cur.fetchone()
                
                if not user:
                    return {
                        'statusCode': 401,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Invalid credentials'}),
                        'isBase64Encoded': False
                    }
                
                user = dict(user)
                token = generate_token()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'token': token,
                        'user': user
                    }),
                    'isBase64Encoded': False
                }
        
        elif method == 'GET':
            params = event.get('queryStringParameters', {})
            user_id = params.get('user_id')
            
            if user_id:
                cur.execute(
                    "SELECT id, email, username, full_name, bio, avatar_url, created_at FROM users WHERE id = %s",
                    (user_id,)
                )
                user = cur.fetchone()
                
                if not user:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'User not found'}),
                        'isBase64Encoded': False
                    }
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(dict(user), default=str),
                    'isBase64Encoded': False
                }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            user_id = body_data.get('user_id')
            
            if not user_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Missing user_id'}),
                    'isBase64Encoded': False
                }
            
            update_fields = []
            update_values = []
            
            if 'full_name' in body_data:
                update_fields.append('full_name = %s')
                update_values.append(body_data['full_name'])
            
            if 'bio' in body_data:
                update_fields.append('bio = %s')
                update_values.append(body_data['bio'])
            
            if 'avatar_url' in body_data:
                update_fields.append('avatar_url = %s')
                update_values.append(body_data['avatar_url'])
            
            if not update_fields:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'No fields to update'}),
                    'isBase64Encoded': False
                }
            
            update_fields.append('updated_at = CURRENT_TIMESTAMP')
            update_values.append(user_id)
            
            query = f"UPDATE users SET {', '.join(update_fields)} WHERE id = %s RETURNING id, email, username, full_name, bio, avatar_url"
            cur.execute(query, tuple(update_values))
            updated_user = dict(cur.fetchone())
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'user': updated_user}),
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