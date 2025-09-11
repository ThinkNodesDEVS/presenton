from sqlmodel import Field, SQLModel


class EmailDomainBlacklist(SQLModel, table=True):
    __tablename__ = "domain_blacklist"

    domain: str = Field(primary_key=True)



