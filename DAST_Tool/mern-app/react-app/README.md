# react-app

# How to run the frontend (without the backend)

If you want to run only the frontend of the `mern-app`, you need to have Node.js installed and follow the following instructions.

1. Install the frontend dependencies by browsing to the `mern-app/react-app` and running:

```bash
    npm i
```

2. Start the frontend by browsing to the `mern-app/react-app` and running:

```bash
    npm start
```

# Frontend Structure

There are six main components (`mern-app/react-app/src/components`):

- `navBar`: Just a navbar to visit the various endpoints of the api.
- `formPage`: Includes the Main Form of the frontend used to start a ZAP scan.
- `notFound`: Just a message to inform the user that the provided url was not found.
- `reportPage`: Includes the table with reports found in the database ass well as the form to upload reports manually.
- `report`: Report using card components when the user provides the id of an existing report-record in the url.
- `alert`: Full description, solution, additional information of an alert given the alert-name and the risk-level.

and fourteen additional utility components (`mern-app/react-app/src/components/utils`).
