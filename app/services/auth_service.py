def verify_user(email: str, password: str) -> bool:
    # Logique temporaire
    return email == "test@mail.com" and password == "1234"


def create_user(fullname: str, email: str, password: str) -> bool:
    # Ici tu mettras plus tard la base de données
    print(f"Création utilisateur : {fullname} - {email}")
    return True