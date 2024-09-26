import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import { Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse';
import { StatisticsServices } from './statistics.service';


const getStatisticsForAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await StatisticsServices.statisticsForAdmin();
  
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Statistics data retrieved successfully",
    data: result,
  });
});


export const StatisticsControllers = {
  getStatisticsForAdmin,
 };