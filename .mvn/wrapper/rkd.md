Stop further exploratory logging and database inspection.

The database has already been verified to contain valid complaints, agencies, and users.
From this point forward, focus ONLY on identifying the exact conditional branch that results in zero complaints.

Proceed as follows:
1. Log and explicitly print the resolved values of:
   - user role (exact string)
   - agencyNo
   - adminMode
2. Print the final WHERE conditions actually applied to the query.
3. Identify ONE boolean condition that incorrectly filters out all rows.
4. Propose a single, minimal code change to fix that condition.

Do not add more logging.
Do not re-check the database.
Do not modify frontend and backend simultaneously.

Converge to a root cause and a fix.