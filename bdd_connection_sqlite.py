#!/usr/bin/env python3
import argparse
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError


def print_rows(result):
    columns = list(result.keys())
    rows = result.fetchall()

    if not rows:
        print("(aucun résultat)")
        return

    print(" | ".join(columns))
    print("-" * 80)

    for row in rows:
        print(" | ".join(str(value) for value in row))


def interactive_shell(db_path):
    engine = create_engine(f"sqlite:///{db_path}")

    print(f"Connecté à {db_path}")
    print("Tape une requête SQL, ou .exit pour quitter.")
    print("Commandes utiles : .tables, .schema NOM_TABLE")

    with engine.connect() as conn:
        buffer = ""

        while True:
            try:
                prompt = "sqlite> " if not buffer else "   ...> "
                line = input(prompt)

                if not line.strip():
                    continue

                if not buffer and line.strip() in (".exit", ".quit"):
                    break

                if not buffer and line.strip() == ".tables":
                    query = """
                    SELECT name
                    FROM sqlite_master
                    WHERE type='table'
                    ORDER BY name;
                    """
                elif not buffer and line.strip().startswith(".schema"):
                    parts = line.strip().split(maxsplit=1)

                    if len(parts) != 2:
                        print("Usage : .schema NOM_TABLE")
                        continue

                    query = """
                    SELECT sql
                    FROM sqlite_master
                    WHERE type='table' AND name = :table_name;
                    """

                    result = conn.execute(
                        text(query),
                        {"table_name": parts[1]}
                    )
                    print_rows(result)
                    continue
                else:
                    buffer += "\n" + line

                    if not buffer.strip().endswith(";"):
                        continue

                    query = buffer.strip()
                    buffer = ""

                result = conn.execute(text(query))

                if result.returns_rows:
                    print_rows(result)
                else:
                    conn.commit()
                    print("OK")

            except KeyboardInterrupt:
                buffer = ""
                print("\nRequête annulée.")
            except EOFError:
                break
            except SQLAlchemyError as e:
                buffer = ""
                print(f"Erreur SQL : {e}")
            except Exception as e:
                buffer = ""
                print(f"Erreur : {e}")


def main():
    parser = argparse.ArgumentParser(
        description="Terminal interactif SQLite avec SQLAlchemy"
    )
    parser.add_argument("database", help="Chemin vers la base SQLite, ex: data.db")

    args = parser.parse_args()
    interactive_shell(args.database)


if __name__ == "__main__":
    main()