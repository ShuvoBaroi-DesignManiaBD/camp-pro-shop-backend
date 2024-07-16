class DataNotFoundError extends Error {
    public statusCode: number;
  
    constructor() {
      super();
      this.message = "No Data Found"
      this.statusCode = 404;
    }
  }
  
  export default DataNotFoundError;
  