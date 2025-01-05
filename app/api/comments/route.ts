import { NextRequest, NextResponse } from 'next/server';
import { auth, firestore, admin } from '@/firebase/server';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';


/**
 * GET /api/comments?postId=XYZ
 * Lista todos os comentários principais (chiefComment) do post, incluindo replies.
 * (Acesso público)
 */
export async function GET(request: NextRequest) {
  try {
      // Lê postId da query string
      const { searchParams } = new URL(request.url);
      const postId = searchParams.get('postId');
      if (!postId) {
          return NextResponse.json({ error: 'Missing postId' }, { status: 400 });
      }

      // Buscar o post pelo slug para obter o ID do documento Firestore
      const postSnap = await firestore
          .collection('posts')
          .where('slug', '==', postId) // Aqui, postId é o slug
          .limit(1)
          .get();

      if (postSnap.empty) {
          return NextResponse.json(
              { error: 'Post not found' },
              { status: 404 }
          );
      }

      const postDoc = postSnap.docs[0];
      const resolvedPostId = postDoc.id;

      // Buscar chiefComments no Firestore usando o resolvedPostId
      const chiefSnap = await firestore
          .collection('comments')
          .where('postId', '==', resolvedPostId)
          .where('chiefComment', '==', true)
          .orderBy('createdAt', 'desc')
          .limit(10) // Ajuste o limite conforme necessário
          .get();

      const comments: any[] = [];

      for (const docSnap of chiefSnap.docs) {
          const data = docSnap.data();
          const docId = docSnap.id;

          // Buscar replies (where repliedTo = docId)
          const repliesSnap = await firestore
              .collection('comments')
              .where('repliedTo', '==', docId)
              .orderBy('createdAt', 'asc')
              .get();

          const replies: any[] = [];
          repliesSnap.forEach((r: QueryDocumentSnapshot) => {
              replies.push({
                  id: r.id,
                  ...r.data(),
              });
          });

          comments.push({
              id: docId,
              ...data,
              replies,
          });
      }

      return NextResponse.json({ comments }, { status: 200 });
  } catch (error) {
      console.error('GET /api/comments ->', error);
      return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

/**
 * POST /api/comments
 * Cria um novo comentário
 */
export async function POST(request: NextRequest) {
    try {
        // 1) Extrai token do header
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const token = authHeader.split('Bearer ')[1];

        // 2) Verifica token com Firebase Admin
        const decoded = await auth.verifyIdToken(token);
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 3) Lê o body
        const body = await request.json();
        const { content, postId, owner, repliedTo, chiefComment } = body;

        if (!content || !postId || !owner) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // 4) Garante que o dono do comentário == usuário logado
        if (owner.id !== decoded.uid) {
            return NextResponse.json(
                { error: 'User ID mismatch' },
                { status: 403 }
            );
        }

        // 5) Buscar o post pelo slug para obter o ID do documento Firestore
        const postSnap = await firestore
            .collection('posts')
            .where('slug', '==', postId) // Aqui, postId é o slug
            .limit(1)
            .get();

        if (postSnap.empty) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            );
        }

        const postDoc = postSnap.docs[0];
        const resolvedPostId = postDoc.id;

        // 6) Monta o objeto do comentário com Timestamp e campos de "Like"
        const newComment = {
            content,
            postId: resolvedPostId, // Armazena o ID do documento Firestore
            owner, // {id, name, avatar}
            repliedTo: repliedTo || null,
            chiefComment: !!chiefComment,
            createdAt: admin.firestore.FieldValue.serverTimestamp(), // Usando Timestamp
            likes: 0, // Inicializa likes
            likedBy: [], // Inicializa likedBy
        };

        // 7) Salva no Firestore
        const docRef = await firestore.collection('comments').add(newComment);

        // 8) Recupera o documento salvo para obter o timestamp
        const savedDoc = await docRef.get();
        const savedData = savedDoc.data();

        return NextResponse.json(
            { commentId: docRef.id, ...savedData },
            { status: 201 }
        );
    } catch (error) {
        console.error('POST /api/comments ->', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}


/**
 * PATCH /api/comments?commentId=ABC
 * Atualiza o conteúdo de um comentário existente ou processa "likes".
 * Exemplo de body JSON para atualizar conteúdo: { "content": "Novo conteúdo" }
 * Exemplo de body JSON para curtir: { "action": "like" }
 * Exemplo de body JSON para descurtir: { "action": "unlike" }
 */

export async function PATCH(request: NextRequest) {
    try {
      // 1) Ler commentId da query
      const { searchParams } = new URL(request.url);
      const commentId = searchParams.get('commentId');
      if (!commentId) {
        return NextResponse.json({ error: 'Missing commentId' }, { status: 400 });
      }
  
      // 2) Token
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const token = authHeader.split('Bearer ')[1];
      const decoded = await auth.verifyIdToken(token);
      if (!decoded) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  
      // 3) Lê body
      const body = await request.json();
  
      // Verifica se é uma atualização de conteúdo ou uma ação de like
      if (body.action === 'like' || body.action === 'unlike') {
        const action = body.action;
        const userId = decoded.uid;
  
        // 4) Buscar o comentário
        const commentRef = firestore.collection('comments').doc(commentId);
        const commentSnap = await commentRef.get();
        if (!commentSnap.exists) {
          return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
        }
  
        const commentData = commentSnap.data();
  
        // 5) Processar a ação de like/unlike
        if (action === 'like') {
          // Verifica se o usuário já curtiu
          if (commentData?.likedBy?.includes(userId)) {
            return NextResponse.json({ error: 'Already liked' }, { status: 400 });
          }
  
          // Atualiza os campos 'likes' e 'likedBy'
          await commentRef.update({
            likes: admin.firestore.FieldValue.increment(1),
            likedBy: admin.firestore.FieldValue.arrayUnion(userId),
          });
  
          return NextResponse.json({ success: true, action: 'liked' }, { status: 200 });
        } else if (action === 'unlike') {
          // Verifica se o usuário já curtiu
          if (!commentData?.likedBy?.includes(userId)) {
            return NextResponse.json({ error: 'Not liked yet' }, { status: 400 });
          }
  
          // Atualiza os campos 'likes' e 'likedBy'
          await commentRef.update({
            likes: admin.firestore.FieldValue.increment(-1),
            likedBy: admin.firestore.FieldValue.arrayRemove(userId),
          });
  
          return NextResponse.json({ success: true, action: 'unliked' }, { status: 200 });
        }
      } else if (body.content) {
        // Processar atualização de conteúdo
        const { content } = body;
        if (!content) {
          return NextResponse.json({ error: 'Missing content' }, { status: 400 });
        }
  
        // Buscar o comentário
        const commentDoc = await firestore.collection('comments').doc(commentId).get();
        if (!commentDoc.exists) {
          return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
        }
  
        const existingComment = commentDoc.data();
  
        // Verifica autor
        if (existingComment?.owner?.id !== decoded.uid) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
  
        // Atualiza conteúdo
        await firestore.collection('comments').doc(commentId).update({ content });
  
        return NextResponse.json({ success: true, content }, { status: 200 });
      } else {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
      }
    } catch (error) {
      console.error('PATCH /api/comments ->', error);
      return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}


/**
 * DELETE /api/comments?commentId=ABC
 * Deleta o comentário (e replies, se chiefComment).
 * Exige token Bearer no header, e o dono do comentário deve bater com user logado.
 */
export async function DELETE(request: NextRequest) {
  try {
    // 1) Ler commentId
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('commentId');
    if (!commentId) {
      return NextResponse.json({ error: 'Missing commentId' }, { status: 400 });
    }

    // 2) Token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split('Bearer ')[1];
    const decoded = await auth.verifyIdToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 3) Buscar comentário
    const commentRef = firestore.collection('comments').doc(commentId);
    const commentSnap = await commentRef.get();
    if (!commentSnap.exists) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    const commentData = commentSnap.data();

    // 4) Verifica autor
    if (commentData?.owner?.id !== decoded.uid) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 5) Se for um chiefComment, apaga as replies
    if (commentData?.chiefComment) {
      const repliesSnap = await firestore
        .collection('comments')
        .where('repliedTo', '==', commentId)
        .get();
      for (const rDoc of repliesSnap.docs) {
        await rDoc.ref.delete();
      }
    }

    // 6) Deleta o próprio comentário
    await commentRef.delete();

    return NextResponse.json({ removed: true }, { status: 200 });
  } catch (error) {
    console.error('DELETE /api/comments ->', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
