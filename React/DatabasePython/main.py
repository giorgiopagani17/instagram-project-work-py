from fastapi import FastAPI, HTTPException, Request, Query , Depends
from pydantic import BaseModel
import mysql.connector
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.responses import RedirectResponse
from fastapi import HTTPException
from fastapi import Request, UploadFile, File, Form
import mysql.connector
import random
import os
from fastapi.responses import JSONResponse
from fastapi import HTTPException
from fastapi.responses import FileResponse
from urllib.parse import unquote
from typing import List
from typing import Optional
import datetime

app = FastAPI()
#uvicorn main:app --reload

#CORS SECURITY BYPASS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="front-end"), name="static")


#-------Connessione al database MySQL-------#
host = "localhost"
username = "root"
password = "root"
db = "instagram"
port = 3306

def create_db_connection():
    connection = None
    try:
        connection = mysql.connector.connect(
            host=host,
            port=port,
            user=username,
            passwd=password,
            database=db
        )
        print("Connessione al Database Riuscita")
    except mysql.connector.Error as err:
        print(f"Error: '{err}'")
    return connection

connection = create_db_connection()


#-------Registrazione Nuovo Utente-------#
@app.post("/reg_utente")
async def register(request: Request):
    data = await request.json()
    usernameUtente = data.get("username")
    nomeUtente = data.get("email")
    passUtente = data.get("password")
    imgUtente = 'C:/Users/giorg/Instagram/imgUtenti/default.jpg'
    description = ""
    
    try:
        cursor = connection.cursor()
        
        # Verifica se lo username esiste già
        query_check_username = "SELECT * FROM users WHERE username = %s"
        cursor.execute(query_check_username, (usernameUtente,))
        existing_username = cursor.fetchone()
        
        if existing_username:
            raise HTTPException(status_code=400, detail="Lo username è già in uso.")
        
        # Verifica se l'email esiste già
        query_check_email = "SELECT * FROM users WHERE email = %s"
        cursor.execute(query_check_email, (nomeUtente,))
        existing_email = cursor.fetchone()
        
        if existing_email:
            raise HTTPException(status_code=400, detail="L'email è già in uso.")
        
        # Se lo username e l'email non esistono già, procedi con l'inserimento
        query_insert = "INSERT INTO users (username, email, password, img, descrizione) VALUES (%s, %s, %s, %s, %s)"
        dati = (usernameUtente, nomeUtente, passUtente, imgUtente, description)
        cursor.execute(query_insert, dati)
        connection.commit()
        return {"Message": "OK"}
    except HTTPException as e:
        raise e
    except Exception as e:
        print("Errore durante la registrazione:", e)
        raise HTTPException(status_code=500, detail="Errore durante la registrazione.")
    finally:
        if 'cursor' in locals(): 
            cursor.close() 
        if 'connection' in locals():
            connection.close()

#-------Login Utente-------#
@app.post("/login")
async def login(request: Request):
    try:
        data = await request.json()
        email = data.get("email")
        password = data.get("password")
        
        cursor = connection.cursor()
        query = "SELECT id, username, img, descrizione FROM users WHERE email = %s AND password = %s"
        cursor.execute(query, (email, password))
        
        user_row = cursor.fetchone()
        if user_row:
            columns = [col[0] for col in cursor.description]  # Ottieni i nomi delle colonne
            user_dict = dict(zip(columns, user_row))
            print("Logged Successfully!")
            return {"success": True, "user": user_dict}
        else:
            raise HTTPException(status_code=401, detail="Credenziali non valide")
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=f"Errore durante il login: {e}")
    finally:
        try:
           cursor.close()
        except mysql.connector.Error as e:
            print(f"Errore durante la chiusura del cursore: {e}")

#-------Get Home Post-------#
class Post(BaseModel):
    id: int
    img_post: str
    descrizione: str
    datepost: str
    num_like: int
    username: str
    user_img: str
    user_id: int

@app.get("/homeposts/{user_id}", response_model=List[Post])
async def get_user_posts(user_id: int) -> List[Post]:
    cursor = connection.cursor(dictionary=True)
    try:
        # Esegui la query SQL per ottenere le informazioni sui post degli utenti seguiti dall'utente specificato
        query = """
            SELECT p.id_post, p.img_post, p.descrizione, p.date, COUNT(l.id_like) AS num_like, u.username, p.id_utente
            FROM post p
            JOIN follow f ON p.id_utente = f.id_utente_seguito
            LEFT JOIN like_instagram l ON p.id_post = l.id_post
            JOIN users u ON p.id_utente = u.id
            WHERE f.id_utente_follower = %s
            GROUP BY p.id_post
        """
        print(query)
        cursor.execute(query, (user_id,))
        result = cursor.fetchall()

        # Creare una lista di oggetti Post anziché una lista di stringhe
        result_posts = []
        for row in result:
            post = Post(
                id=row["id_post"],
                img_post=row["img_post"].replace("C:/Users/giorg/Instagram/postUtenti/", "http://localhost:8000/post/"),
                descrizione=row["descrizione"],
                datepost=row["date"].strftime("%Y-%m-%d"),
                num_like=row["num_like"],
                username=row["username"],
                user_img=f"http://localhost:8000/img/{row['id_utente']}",
                user_id=row['id_utente']
            )
            result_posts.append(post)
        
        # Inverti l'ordine delle immagini
        result_posts.reverse()

        return result_posts
    except mysql.connector.Error as e:
        # Se si verifica un errore durante l'esecuzione della query, restituisci un'eccezione HTTP 500
        raise HTTPException(status_code=500, detail=f"Errore nel recupero dei post: {e}")
    finally:
        cursor.close()

#-------Immagine Profilo Utente-------#
def get_image_url(image_path):
    base_url = "http://localhost:8000/getimg/"
    image_url = base_url + image_path
    return image_url

# Endpoint per ottenere i dati dell'utente
@app.get("/img/{user_id}")
async def get_user_data(user_id: int):
    try:
        cursor = connection.cursor()
        query = "SELECT img FROM users WHERE id = %s"
        cursor.execute(query, (user_id,))
            
        user_image_path = cursor.fetchone()
        if user_image_path:
            # Ottieni il percorso dell'immagine dall'output della query
            image_path = user_image_path[0]
            # Ottieni l'URL completo dell'immagine
            get_image_url(image_path)
            # Restituisci l'URL come parte della risposta
            return FileResponse(image_path, media_type="image/jpeg")
        else:
            raise HTTPException(status_code=404, detail="Utente non trovato")
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=f"Errore durante il recupero dell'immagine: {e}")
    finally:
        try:
            cursor.close()
        except mysql.connector.Error as e:
            print(f"Errore durante la chiusura del cursore: {e}")


#-------Info Utente-------#
@app.get("/profileinfo/{user_id}")
async def get_users(user_id: int):
    cursor = connection.cursor(dictionary=True)
    try:
        query_username = "SELECT username FROM users WHERE id = %s"
        query_description = "SELECT descrizione FROM users WHERE id = %s"
        query_following = "SELECT COUNT(id_utente_seguito) as num_following FROM follow WHERE id_utente_follower = %s"
        query_posts = "SELECT COUNT(id_post) as num_posts FROM post WHERE id_utente = %s"

        # Esecuzione delle query
        cursor.execute(query_username, (user_id,))
        username_row = cursor.fetchone()
        username = username_row['username'] if username_row else None

        cursor.execute(query_description, (user_id,))
        description_row = cursor.fetchone()
        description = description_row['descrizione'] if description_row else None

        cursor.execute(query_following, (user_id,))
        num_following_row = cursor.fetchone()
        num_following = num_following_row['num_following'] if num_following_row else 0

        cursor.execute(query_posts, (user_id,))
        num_posts_row = cursor.fetchone()
        num_posts = num_posts_row['num_posts'] if num_posts_row else 0

        return {
            "username": username,
            "description": description,
            "num_following": num_following,
            "num_posts": num_posts
        }
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=f"Errore nel recupero delle informazioni dal database: {e}")
    finally:
        cursor.close()



#-------Upload Post Utente-------#
@app.post("/upload/{user_id}")
async def upload_image(user_id: int, file: UploadFile = File(...), description: str = Form(default="")):
    try:
        # Assicurati di avere una cartella dove salvare le immagini
        save_folder = "C:/Users/giorg/Instagram/postUtenti/"
        if not os.path.exists(save_folder):
            os.makedirs(save_folder)
        # Leggi i dati del file e scrivi l'immagine nella cartella
        file_path = os.path.join(save_folder, file.filename)
        with open(file_path, "wb") as image_file:
            image_file.write(await file.read())
        # Inserisci i dati nel database
        cursor = connection.cursor()
        img_path = save_folder + file.filename
        solo_data_attuale = datetime.date.today()
        query = "INSERT INTO post (id_utente, img_post, descrizione, date) VALUES (%s, %s, %s, %s)"  # Usiamo i parametri della query per passare i valori in modo sicuro
        dati = ((user_id), img_path, description, solo_data_attuale)
        cursor.execute(query, dati)
        connection.commit()

        return {"filename": img_path, "description": description, "user_id": (user_id)}
    except Exception as e:
        print("Errore durante l'upload e l'inserimento nel database:", str(e))
        connection.rollback()
        return {"Message": "Error"}

    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'connection' in locals():
            connection.close()

#-------Upload Profile Image-------#
@app.post("/imgprofile/{user_id}")
async def upload_image(user_id: int, file: UploadFile = File(...)):
    try:
        # Assicurati di avere una cartella dove salvare le immagini
        save_folder = "C:/Users/giorg/Instagram/imgUtenti/"
        if not os.path.exists(save_folder):
            os.makedirs(save_folder)

        # Ottieni il percorso dell'immagine vecchia dal database
        cursor = connection.cursor()
        query = "SELECT img FROM users WHERE id = %s"
        cursor.execute(query, (user_id,))
        old_img_path = cursor.fetchone()[0]

        # Elimina l'immagine precedente se esiste
        if old_img_path and old_img_path != 'C:/Users/giorg/Instagram/imgUtenti/default.jpg':
            if os.path.exists(old_img_path):
                os.remove(old_img_path)

        # Scrivi quindi la nuova immagine nella cartella
        file_path = os.path.join(save_folder, f"user_{user_id}.jpg")
        with open(file_path, "wb") as image_file:
            image_file.write(await file.read())

        # Aggiorna il percorso dell'immagine nel database
        query = "UPDATE users SET img = %s WHERE id = %s"
        cursor.execute(query, (file_path, user_id))
        connection.commit()

        return {"filename": file_path, "user_id": user_id}
    except Exception as e:
        print("Errore durante l'upload e l'inserimento nel database:", str(e))
        connection.rollback()
        return {"Message": "Error"}

    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'connection' in locals():
            connection.close()

#-------Reset Profile Image-------#
@app.post("/imgprofile/{user_id}/{imageName}")
async def upload_image(user_id:int, imageName: str):
    try:
        # Assicurati di avere una cartella dove salvare le immagini
        save_folder = "C:/Users/giorg/Instagram/imgUtenti/"
        if not os.path.exists(save_folder):
            os.makedirs(save_folder)

        # Selezione l'immagine vecchia nel database
        cursor = connection.cursor()
        query = "SELECT img FROM users WHERE id = %s"
        cursor.execute(query, (user_id,))
        old_img_path = cursor.fetchone()[0]

        # Elimina l'immagine precedente se esiste
        if old_img_path and old_img_path != 'C:/Users/giorg/Instagram/imgUtenti/default.jpg':
            if os.path.exists(old_img_path):
                os.remove(old_img_path)

        # Aggiorna il percorso dell'immagine nel database
        file_path  = f"C:/Users/giorg/Instagram/imgUtenti/{imageName}"
        query = "UPDATE users SET img = %s WHERE id = %s"
        cursor.execute(query, (file_path, user_id))
        connection.commit()

        return {"filename": file_path, "user_id": user_id}
    except Exception as e:
        print("Errore durante l'upload e l'inserimento nel database:", str(e))
        connection.rollback()
        return {"Message": "Error"}

    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'connection' in locals():
            connection.close()

#-------Get Posts Utente-------#
@app.get("/user_post/{user_id}")
async def get_user_images(user_id: int):
    cursor = connection.cursor(dictionary=True)
    try:
        # Esegui una query per ottenere solo gli URL delle immagini dell'utente specificato
        cursor.execute("SELECT img_post FROM post WHERE id_utente = %s", (user_id,))
        images = cursor.fetchall()
        
        if not images:
            return JSONResponse(status_code=200, content={"message": "Nessun post trovato per questo utente", "num_posts": 0})
        
        # Estrai solo gli URL delle immagini dalla lista di dizionari e rimuovi la parte iniziale fissa
        image_urls = [image["img_post"].replace("C:/Users/giorg/Instagram/postUtenti/", "http://localhost:8000/post/") for image in images]
        
        # Inverti l'ordine delle immagini
        image_urls.reverse()
        
        return image_urls
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=f"Errore nel recupero delle immagini dell'utente dal database: {e}")
    finally:
        cursor.close()

@app.get("/post/{img_name}")
async def get_user_image(img_name: str):
    try:
        # Costruisci l'URL completo dell'immagine
        full_image_path = f"C:/Users/giorg/Instagram/postUtenti/{img_name}"

        print(full_image_path)
        get_image_url(full_image_path)

        # Restituisci l'immagine come parte della risposta
        return FileResponse(full_image_path, media_type="image/jpeg")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore durante il recupero dell'immagine: {e}")


#-------Search Utenti-------#
@app.get("/api/users")
async def search_users(search: str = Query(None)):
    cursor = connection.cursor(dictionary=True)
    try:
        if search:
            query = "SELECT id, username, img FROM users WHERE username LIKE %s"
            cursor.execute(query, ("%" + search + "%",))
            users = cursor.fetchall()
            print(users)
            return users
        else:
            query = "SELECT id, username, img FROM users"
            cursor.execute(query)
            users = cursor.fetchall()
            random.shuffle(users)
            return users
    finally:
        cursor.close()

#-------Check Number Follower-------#
@app.get("/follower/{user_id}")
async def get_follow_info(user_id: int):
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("SELECT COUNT(id_utente_follower) as num_follower FROM follow WHERE id_utente_seguito = %s", (user_id,))
        result = cursor.fetchone()  # Utilizza fetchone() per ottenere una sola riga
        num_follower = result['num_follower'] if result else 0  # Se non ci sono follower, restituisci 0
        print(num_follower)
        return {"num_follower": num_follower}  # Restituisci il conteggio dei follower
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=f"Errore nel recupero delle informazioni sul follow: {e}")
    finally:
        cursor.close()


#-------Check Follow-------#
@app.get("/followinfo/{user_id}/{id_followed}")
async def get_follow_info(user_id: int, id_followed: int):
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id_follow FROM follow WHERE id_utente_follower = %s AND id_utente_seguito = %s", (user_id, id_followed))
        result = cursor.fetchall()
        print(result)
        if not result:
            return JSONResponse(status_code=200, content={"follow": False})
        else:
            return JSONResponse(status_code=200, content={"follow": True})
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=f"Errore nel recupero delle informazioni sul follow: {e}")
    finally:
        cursor.close()

#-------Follow Utente-------#
@app.post("/follow")
async def follow(request: Request):
    data = await request.json()
    loggedInUser = data.get("loggedInUserId")
    idUserFollowed = data.get("idUserFollowed")
    print(loggedInUser)
    print(idUserFollowed)
    try:
        cursor = connection.cursor()
        query = ("INSERT INTO `follow`(`id_utente_follower`, `id_utente_seguito`) VALUES (%s, %s)")
        dati = (loggedInUser, idUserFollowed)
        cursor.execute(query, dati)
        connection.commit()
        return {"Message:" : "OK"}
    except:
        print("Errore di inserimento ")
        return {"Message: ": "Error"}
    finally:
        if 'cursor' in locals(): 
            cursor.close() 
        if 'connection' in locals():
            connection.close()
 
# -------Unfollow Utente-------#
@app.delete("/unfollow/{loggedInUserId}/{idUserUnfollowed}")
async def unfollow(loggedInUserId: int, idUserUnfollowed: int):
    try:
        cursor = connection.cursor()
        query = "DELETE FROM follow WHERE id_utente_follower = %s AND id_utente_seguito = %s"
        data = (loggedInUserId, idUserUnfollowed)
        cursor.execute(query, data)
        connection.commit()
        return {"message": "Unfollowed successfully"}
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=f"Error unfollowing user: {e}")
    finally:
        if 'cursor' in locals():
            cursor.close()

#-------Is Like From LoggedInUser?-------#
@app.get("/isLiked/{post_id}/{user_id}", response_model=bool)
async def get_post_likes(post_id: int, user_id: int) -> bool:
    cursor = connection.cursor()
    try:
        # Esegui la query SQL per verificare se l'utente ha messo like al post
        query = """
            SELECT COUNT(id_utente_like) AS num_likes
            FROM like_instagram
            WHERE id_post = %s AND id_utente_like = %s
        """
        cursor.execute(query, (post_id, user_id))
        result = cursor.fetchone()

        # Estrai il numero di like dell'utente per il post specificato
        num_likes = result[0]

        # Restituisci True se l'utente ha messo like, altrimenti False
        return num_likes > 0
    except mysql.connector.Error as e:
        # Se si verifica un errore durante l'esecuzione della query, restituisci un'eccezione HTTP 500
        raise HTTPException(status_code=500, detail=f"Errore nel recupero dei like del post: {e}")
    finally:
        cursor.close()

#-------Like Post-------#
@app.post("/like/{post_id}/{user_id}")
async def like(post_id: int, user_id: int):
    cursor = connection.cursor()
    print(post_id)
    print(user_id)
    try:
        # Controlla se l'utente ha già messo "mi piace" a questo post
        query_check_like = "SELECT id_like FROM like_instagram WHERE id_post = %s AND id_utente_like = %s"
        cursor.execute(query_check_like, (post_id, user_id))
        existing_like = cursor.fetchone()

        if existing_like:
            # Se l'utente ha già messo "mi piace", restituisci un messaggio di errore
            raise HTTPException(status_code=400, detail="Hai già messo mi piace a questo post.")

        # Se l'utente non ha ancora messo "mi piace", aggiungi il like al post
        query_add_like = "INSERT INTO like_instagram (id_post, id_utente_like) VALUES (%s, %s)"
        cursor.execute(query_add_like, (post_id, user_id))
        connection.commit()

        # Restituisci un messaggio di successo
        return {"message": "Hai messo mi piace a questo post."}

    except mysql.connector.Error as e:
        # Stampa l'errore esatto
        print("Errore MySQL:", e)
        # Restituisci un errore HTTP 500
        raise HTTPException(status_code=500, detail="Errore durante l'aggiunta del like al post.")
    finally:
        cursor.close()

#-------Unlike Post-------#
@app.delete("/unlike/{post_id}/{user_id}")
async def unlike(post_id: int, user_id: int):
    try:
        cursor = connection.cursor()
        query = "DELETE FROM like_instagram WHERE id_post = %s AND id_utente_like = %s"
        data = (post_id, user_id)
        cursor.execute(query, data)
        connection.commit()
        return {"message": "Unliked successfully"}
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=f"Error unlike post: {e}")
    finally:
        if 'cursor' in locals():
            cursor.close()

#-------Recupero Info Dal Post-------#
@app.get("/infoPost/{post_img}")
async def get_post_info(post_img: str):
    cursor = connection.cursor(dictionary=True)  # Imposta il cursore in modo che i risultati siano restituiti come dizionari

    try:
        # Esegui la query SQL per ottenere le informazioni sul post
        query = """
            SELECT post.id_post, post.id_utente, post.descrizione, post.date, users.username, users.img
            FROM post
            INNER JOIN users ON post.id_utente = users.id
            WHERE post.img_post LIKE CONCAT('%', %s, '%')
        """
        cursor.execute(query, (post_img,))

        print(cursor)
        post_info = cursor.fetchone()

        if post_info:
            # Ora puoi ottenere l'ID del post, l'ID dell'utente, la descrizione del post e lo username dell'utente
            post_id = post_info['id_post']
            user_id = post_info['id_utente']
            description = post_info['descrizione']
            date = post_info['date']
            username = post_info['username']
            imgProfile = f'http://localhost:8000/img/{user_id}'

            # Ora puoi eseguire un'altra query per ottenere il numero di like del post
            like_query = """
                SELECT COUNT(*) AS num_likes
                FROM like_instagram
                WHERE id_post = %s
            """
            cursor.execute(like_query, (post_id,))
            num_likes = cursor.fetchone()['num_likes']

            print(description)

            # Restituisci le informazioni del post
            return {
                'post_id': post_id,
                'user_id': user_id,
                'username': username,
                'descrizionepost': description,
                'datepost' : date,
                'num_likes': num_likes,
                'imgProfile' : imgProfile
            }
        else:
            return {"message": "Post non trovato"}

    except mysql.connector.Error as e:
        # Se si verifica un errore durante l'esecuzione della query, restituisci un'eccezione HTTP 500
        raise HTTPException(status_code=500, detail=f"Errore nel recupero delle informazioni del post: {e}")
    finally:
        cursor.close()

#-------Explore Posts-------#
@app.get("/exploreposts/{user_id}")
async def get_user_images(user_id: int):
    cursor = connection.cursor(dictionary=True)
    try:
        # Esegui una query per ottenere solo gli URL delle immagini dell'utente specificato
        cursor.execute("SELECT img_post FROM post WHERE id_utente != %s", (user_id,))
        images = cursor.fetchall()
        
        if not images:
            return JSONResponse(status_code=200, content={"message": "Nessun post trovato per questo utente", "num_posts": 0})
        
        # Estrai solo gli URL delle immagini dalla lista di dizionari e rimuovi la parte iniziale fissa
        image_urls = [image["img_post"].replace("C:/Users/giorg/Instagram/postUtenti/", "http://localhost:8000/post/") for image in images]
        
        # Inverti l'ordine delle immagini
        random.shuffle(image_urls)

        return image_urls
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=f"Errore nel recupero delle immagini dell'utente dal database: {e}")
    finally:
        cursor.close()

#-------Change Info Profile-------#
@app.put("/changeinfo/{user_id}")
async def change_user_info(user_id: int, request: Request):
    data = await request.json()
    
    username = data["username"]
    password = data["password"]
    description = data["description"]
    
    try:
        cursor = connection.cursor()

        # Verifica se lo username esiste già
        cursor.execute("SELECT COUNT(*) FROM users WHERE username = %s AND id != %s", (username, user_id))
        existing_username_count = cursor.fetchone()[0]

        if existing_username_count > 0:
            raise HTTPException(status_code=400, detail="Lo username è già in uso")

        # Esegui l'aggiornamento se lo username non esiste già
        query = "UPDATE users SET username = %s, password = %s, descrizione = %s WHERE id = %s"
        cursor.execute(query, (username, password, description, user_id))
        connection.commit()
        affected_rows = cursor.rowcount
        cursor.close()
        
        if affected_rows > 0:
            return {"message": "Informazioni utente aggiornate con successo"}
        else:
            raise HTTPException(status_code=404, detail="Modifiche non avvenute")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
#-------Get Biografia e Password-------#
@app.get("/infotoupdate/{user_id}")
async def get_user_images(user_id: int):
    cursor = connection.cursor(dictionary=True)
    try:
        # Esegui una query per ottenere solo gli URL delle immagini dell'utente specificato
        cursor.execute("SELECT descrizione, password FROM users WHERE id = %s", (user_id,))
        result = cursor.fetchall()
        
        return result
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=f"Errore nel recupero della biografia dell'utente dal database: {e}")
    finally:
        cursor.close()

#-------Search Seguiti-------#
@app.get("/api/seguiti")
async def search_seguiti(id: int, search: str = Query(None)):
    cursor = connection.cursor(dictionary=True)
    try:
        if search is not None:
            query = """
                SELECT u_followed.id, u_followed.username, u_followed.img
                FROM users u_followed
                INNER JOIN follow f ON u_followed.id = f.id_utente_seguito
                WHERE f.id_utente_follower = %s AND u_followed.username LIKE CONCAT('%', %s, '%')
                LIMIT 0, 25;
            """
            cursor.execute(query, (id, search))
            users = cursor.fetchall()
            users.reverse()
            return users
        else:
            query = """
            SELECT u.id, u.username, u.img 
            FROM users u 
            INNER JOIN follow f ON u.id = f.id_utente_seguito
            WHERE f.id_utente_follower = %s;
            """
            cursor.execute(query, (id,))
            users = cursor.fetchall()
            users.reverse()
            return users
    finally:
        cursor.close()

#-------Search Follower-------#
@app.get("/api/followers")
async def search_followers(id: int, search: str = Query(None)):
    cursor = connection.cursor(dictionary=True)
    try:
        if search is not None:
            query = """
                SELECT u_follower.id,  u_follower.username, u_follower.img
                FROM users u_follower
                INNER JOIN follow f ON u_follower.id = f.id_utente_follower
                WHERE f.id_utente_seguito = %s AND u_follower.username LIKE CONCAT('%', %s, '%')
                LIMIT 0, 25;
            """
            cursor.execute(query, (id, search))
            users = cursor.fetchall()
            users.reverse()
            return users
        else:
            query = """
            SELECT u.id, u.username, u.img 
            FROM users u 
            INNER JOIN follow f ON u.id = f.id_utente_follower
            WHERE f.id_utente_seguito = %s;
            """
            cursor.execute(query, (id,))
            users = cursor.fetchall()
            users.reverse()
            return users
    finally:
        cursor.close()

#-------Search Utenti Like-------#
@app.get("/api/userslike")
async def search_utenti_like(id_post: int, search: str = Query(None)):
    cursor = connection.cursor(dictionary=True)
    try:
        if search is not None:
            query = """
                SELECT u.id, u.username, u.img
                FROM users u
                INNER JOIN like_instagram l ON u.id = l.id_utente_like
                INNER JOIN post p ON l.id_post = p.id_post
                WHERE p.id_post = %s AND u.username LIKE CONCAT('%', %s, '%')
                LIMIT 0, 25;
            """
            cursor.execute(query, (id_post, search))
            users = cursor.fetchall()
            users.reverse()
            return users
        else:
            query = """
            SELECT u.id, u.username, u.img
            FROM users u
            INNER JOIN like_instagram l ON u.id = l.id_utente_like
            INNER JOIN post p ON l.id_post = p.id_post
            WHERE p.id_post = %s
            LIMIT 0, 25;
            """
            cursor.execute(query, (id_post,))
            users = cursor.fetchall()
            users.reverse()
            return users
    finally:
        cursor.close()
