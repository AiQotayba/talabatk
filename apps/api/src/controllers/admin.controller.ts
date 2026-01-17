import { Response } from 'express';
import { sendSuccess, sendError, sendPaginatedSuccess } from '../utils/response.util';
import { AuthenticatedRequest } from '../types/common.types';
import prisma from '../config/database';
import { OrderStatus, UserRole } from '@prisma/client';

export const getAllOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { 
      status, 
      date_from, 
      date_to, 
      page = 1, 
      limit = 20,
      client_id,
      driver_id 
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (client_id) {
      where.client_id = client_id;
    }
    
    if (driver_id) {
      where.driver_id = driver_id;
    }
    
    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) {
        where.created_at.gte = new Date(date_from as string);
      }
      if (date_to) {
        where.created_at.lte = new Date(date_to as string);
      }
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
            }
          },
          driver: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
            }
          },
          address: true,
          ratings: true,
          complaints: true,
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.order.count({ where }),
    ]);

    const totalPages = Math.ceil(total / Number(limit));

    // Convert BigInt to Number for JSON serialization
    const serializedOrders = orders.map(order => ({
      ...order,
      price_cents: order.price_cents ? Number(order.price_cents) : null,
    }));

    sendPaginatedSuccess(res, serializedOrders, {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages,
    }, 'Orders retrieved successfully');
  } catch (error) {
    console.error('Get all orders error:', error);
    sendError(res, 'حدث خطأ أثناء تحميل الطلبات. يرجى المحاولة مرة أخرى', 500);
  }
};

export const getAllDrivers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {
      role: UserRole.driver,
    };

    if (status) {
      // This would need to be implemented based on your driver status logic
      // For now, we'll use metadata or a separate status field
    }

    const [drivers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          phone_verified: true,
          profile_photo_url: true,
          metadata: true,
          created_at: true,
          updated_at: true,
          orders: {
            where: { status: OrderStatus.delivered },
            select: { id: true },
          },
          ratingsReceived: {
            select: { score: true },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.user.count({ where }),
    ]);

    // Calculate driver stats
    const driversWithStats = drivers.map(driver => {
      const totalOrders = driver.orders.length;
      const averageRating = driver.ratingsReceived.length > 0
        ? driver.ratingsReceived.reduce((sum, rating) => sum + rating.score, 0) / driver.ratingsReceived.length
        : 0;

      return {
        ...driver,
        stats: {
          total_orders: totalOrders,
          average_rating: Math.round(averageRating * 100) / 100,
          total_ratings: driver.ratingsReceived.length,
        }
      };
    });

    const totalPages = Math.ceil(total / Number(limit));

    sendPaginatedSuccess(res, driversWithStats, {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages,
    }, 'Drivers retrieved successfully');
  } catch (error) {
    console.error('Get all drivers error:', error);
    sendError(res, 'حدث خطأ أثناء تحميل قائمة السائقين. يرجى المحاولة مرة أخرى', 500);
  }
};

export const updateDriver = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const driverId = req.params.id;
    const { status, notes } = req.body;

    const driver = await prisma.user.findUnique({
      where: { id: driverId, role: UserRole.driver },
    });

    if (!driver) {
      sendError(res, 'لم يتم العثور على السائق. يرجى التحقق من رقم السائق', 404);
      return;
    }

    // Update driver metadata with admin notes
    const updatedDriver = await prisma.user.update({
      where: { id: driverId },
      data: {
        metadata: {
          ...driver.metadata as any,
          admin_status: status,
          admin_notes: notes,
          updated_by_admin: new Date().toISOString(),
        },
        updated_at: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        metadata: true,
        updated_at: true,
      }
    });

    sendSuccess(res, updatedDriver, 'تم تحديث بيانات السائق بنجاح! تم حفظ التغييرات');
  } catch (error) {
    console.error('Update driver error:', error);
    sendError(res, 'حدث خطأ أثناء تحديث بيانات السائق. يرجى المحاولة مرة أخرى', 500);
  }
};

export const getAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { period = 'monthly' } = req.query;

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Get analytics data
    const [
      totalOrders,
      completedOrders,
      pendingOrders,
      cancelledOrders,
      totalRevenue,
      totalUsers,
      totalDrivers,
      recentOrders,
    ] = await Promise.all([
      prisma.order.count({
        where: { created_at: { gte: startDate } }
      }),
      prisma.order.count({
        where: { 
          status: OrderStatus.delivered,
          created_at: { gte: startDate }
        }
      }),
      prisma.order.count({
        where: { 
          status: { in: [OrderStatus.pending, OrderStatus.assigned, OrderStatus.accepted] },
          created_at: { gte: startDate }
        }
      }),
      prisma.order.count({
        where: { 
          status: OrderStatus.cancelled,
          created_at: { gte: startDate }
        }
      }),
      prisma.order.aggregate({
        where: { 
          status: OrderStatus.delivered,
          created_at: { gte: startDate }
        },
        _sum: { price_cents: true }
      }),
      prisma.user.count({
        where: { 
          role: UserRole.client,
          created_at: { gte: startDate }
        }
      }),
      prisma.user.count({
        where: { 
          role: UserRole.driver,
          created_at: { gte: startDate }
        }
      }),
      prisma.order.findMany({
        where: { created_at: { gte: startDate } },
        include: {
          client: { select: { name: true } },
          driver: { select: { name: true } },
        },
        orderBy: { created_at: 'desc' },
        take: 10,
      }),
    ]);

    const analytics = {
      period,
      date_range: {
        start: startDate,
        end: now,
      },
      orders: {
        total: totalOrders,
        completed: completedOrders,
        pending: pendingOrders,
        cancelled: cancelledOrders,
        completion_rate: totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0,
      },
      revenue: {
        total_cents: totalRevenue._sum.price_cents ? Number(totalRevenue._sum.price_cents) : 0,
        total_dollars: totalRevenue._sum.price_cents ? Number(totalRevenue._sum.price_cents) / 100 : 0,
      },
      users: {
        total_clients: totalUsers,
        total_drivers: totalDrivers,
      },
      recent_orders: recentOrders.map(order => ({
        ...order,
        price_cents: order.price_cents ? Number(order.price_cents) : null,
      })),
    };

    sendSuccess(res, analytics, 'تم تحميل الإحصائيات بنجاح');
  } catch (error) {
    console.error('Get analytics error:', error);
    sendError(res, 'حدث خطأ أثناء تحميل الإحصائيات. يرجى المحاولة مرة أخرى', 500);
  }
};

export const getDashboardStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalOrders,
      activeOrders,
      totalUsers,
      activeDrivers,
      todayRevenue,
      monthlyRevenue,
      pendingOrders,
      assignedOrders,
      inProgressOrders,
      deliveredOrders,
      cancelledOrders,
      todayOrders,
      recentOrders,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({
        where: {
          status: { in: [OrderStatus.pending, OrderStatus.assigned, OrderStatus.accepted, OrderStatus.picked_up, OrderStatus.in_transit] }
        }
      }),
      prisma.user.count({ where: { role: UserRole.client } }),
      prisma.user.count({
        where: {
          role: UserRole.driver,
          // You might want to add a status check here based on your driver status logic
        }
      }),
      prisma.order.aggregate({
        where: {
          status: OrderStatus.delivered,
          created_at: { gte: todayStart }
        },
        _sum: { price_cents: true }
      }),
      prisma.order.aggregate({
        where: {
          status: OrderStatus.delivered,
          created_at: { gte: monthStart }
        },
        _sum: { price_cents: true }
      }),
      prisma.order.count({ where: { status: OrderStatus.pending } }),
      prisma.order.count({ where: { status: OrderStatus.assigned } }),
      prisma.order.count({
        where: {
          status: { in: [OrderStatus.accepted, OrderStatus.picked_up, OrderStatus.in_transit] }
        }
      }),
      prisma.order.count({ where: { status: OrderStatus.delivered } }),
      prisma.order.count({ where: { status: OrderStatus.cancelled } }),
      prisma.order.count({
        where: { created_at: { gte: todayStart } }
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { created_at: 'desc' },
        include: {
          client: {
            select: {
              id: true,
              name: true,
            }
          },
          driver: {
            select: {
              id: true,
              name: true,
            }
          },
        },
      }),
    ]);

    // Get orders change (last 30 days vs previous 30 days)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    
    const [ordersLast30Days, ordersPrevious30Days] = await Promise.all([
      prisma.order.count({
        where: { created_at: { gte: thirtyDaysAgo } }
      }),
      prisma.order.count({
        where: {
          created_at: {
            gte: sixtyDaysAgo,
            lt: thirtyDaysAgo
          }
        }
      })
    ]);

    const ordersChange = ordersPrevious30Days > 0
      ? Math.round(((ordersLast30Days - ordersPrevious30Days) / ordersPrevious30Days) * 100)
      : 0;

    // Get users change
    const [usersLast30Days, usersPrevious30Days] = await Promise.all([
      prisma.user.count({
        where: {
          role: UserRole.client,
          created_at: { gte: thirtyDaysAgo }
        }
      }),
      prisma.user.count({
        where: {
          role: UserRole.client,
          created_at: {
            gte: sixtyDaysAgo,
            lt: thirtyDaysAgo
          }
        }
      })
    ]);

    const usersChange = usersPrevious30Days > 0
      ? Math.round(((usersLast30Days - usersPrevious30Days) / usersPrevious30Days) * 100)
      : 0;

    const stats = {
      totalOrders,
      activeOrders,
      totalUsers,
      activeDrivers,
      todayRevenue: todayRevenue._sum.price_cents ? Number(todayRevenue._sum.price_cents) : 0,
      monthlyRevenue: monthlyRevenue._sum.price_cents ? Number(monthlyRevenue._sum.price_cents) : 0,
      ordersChange,
      usersChange,
      orders: {
        pending: pendingOrders,
        assigned: assignedOrders,
        inProgress: inProgressOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders,
        today: todayOrders,
      },
      recentOrders: recentOrders.map(order => ({
        ...order,
        price_cents: order.price_cents ? Number(order.price_cents) : null,
      })),
    };

    sendSuccess(res, stats, 'تم تحميل إحصائيات لوحة التحكم بنجاح');
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    sendError(res, 'حدث خطأ أثناء تحميل إحصائيات لوحة التحكم. يرجى المحاولة مرة أخرى', 500);
  }
};

export const getAllUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          profile_photo_url: true,
          created_at: true,
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / Number(limit));

    sendPaginatedSuccess(res, users, {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages,
    }, 'Users retrieved successfully');
  } catch (error) {
    console.error('Get all users error:', error);
    sendError(res, 'حدث خطأ أثناء تحميل قائمة المستخدمين. يرجى المحاولة مرة أخرى', 500);
  }
};

export const getUserById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        profile_photo_url: true,
        created_at: true,
        orders: {
          take: 10,
          orderBy: { created_at: 'desc' },
          include: {
            address: true,
          },
        },
      },
    });

    if (!user) {
      sendError(res, 'لم يتم العثور على المستخدم. يرجى التحقق من رقم المستخدم', 404);
      return;
    }

    // Calculate stats based on user role
    let stats: any = {};
    
    if (user.role === UserRole.client) {
      const [totalOrders, completedOrders] = await Promise.all([
        prisma.order.count({ where: { client_id: userId } }),
        prisma.order.count({
          where: {
            client_id: userId,
            status: OrderStatus.delivered,
          },
        }),
      ]);
      stats = {
        total_orders: totalOrders,
        completed_orders: completedOrders,
      };
    } else if (user.role === UserRole.driver) {
      const [totalOrders, completedOrders, ratings] = await Promise.all([
        prisma.order.count({ where: { driver_id: userId } }),
        prisma.order.count({
          where: {
            driver_id: userId,
            status: OrderStatus.delivered,
          },
        }),
        prisma.rating.findMany({
          where: { driver_id: userId },
          select: { score: true },
        }),
      ]);
      const averageRating =
        ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
          : 0;
      stats = {
        total_orders: totalOrders,
        completed_orders: completedOrders,
        average_rating: Math.round(averageRating * 100) / 100,
      };
    }

    const userWithStats = {
      ...user,
      stats,
      orders: user.orders.map((order) => ({
        ...order,
        price_cents: order.price_cents ? Number(order.price_cents) : null,
      })),
    };

    sendSuccess(res, userWithStats, 'تم تحميل تفاصيل المستخدم بنجاح');
  } catch (error) {
    console.error('Get user by id error:', error);
    sendError(res, 'حدث خطأ أثناء تحميل تفاصيل المستخدم. يرجى المحاولة مرة أخرى', 500);
  }
};

export const getComplaints = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, status = 'pending' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [complaints, total] = await Promise.all([
      prisma.complaint.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
            }
          },
          order: {
            select: {
              id: true,
              content: true,
              status: true,
              created_at: true,
              driver: {
                select: {
                  id: true,
                  name: true,
                  phone: true,
                }
              }
            }
          }
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.complaint.count({ where }),
    ]);

    const totalPages = Math.ceil(total / Number(limit));

    sendPaginatedSuccess(res, complaints, {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages,
    }, 'Complaints retrieved successfully');
  } catch (error) {
    console.error('Get complaints error:', error);
    sendError(res, 'حدث خطأ أثناء تحميل قائمة الشكاوى. يرجى المحاولة مرة أخرى', 500);
  }
};

export const getMap = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { status = 'all' } = req.query;

    let where: any = {};

    // Filter by status
    if (status && status !== 'all') {
      if (status === 'in_progress') {
        where.status = { in: [OrderStatus.accepted, OrderStatus.picked_up, OrderStatus.in_transit] };
      } else {
        where.status = status;
      }
    }

    // Only get orders with valid addresses and coordinates
    const orders = await prisma.order.findMany({
      where: {
        ...where,
        address: {
          isNot: null,
        },
      },
      include: {
        address: {
          select: {
            id: true,
            street: true,
            city: true,
            lat: true,
            lng: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
      take: 500, // Limit for map performance
    });

    // Filter orders with valid coordinates (after fetching)
    const ordersWithValidCoords = orders.filter(order => 
      order.address &&
      order.address.lat !== null &&
      order.address.lat !== 0 &&
      order.address.lng !== null &&
      order.address.lng !== 0
    );

    // Serialize orders
    const serializedOrders = ordersWithValidCoords.map(order => ({
      ...order,
      price_cents: order.price_cents ? Number(order.price_cents) : null,
    }));

    sendSuccess(res, serializedOrders, 'تم تحميل طلبات الخريطة بنجاح');
  } catch (error) {
    console.error('Get map error:', error);
    sendError(res, 'حدث خطأ أثناء تحميل طلبات الخريطة. يرجى المحاولة مرة أخرى', 500);
  }
};

export const getMapDrivers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Get all drivers with their current location from metadata
    const drivers = await prisma.user.findMany({
      where: {
        role: UserRole.driver,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        profile_photo_url: true,
        metadata: true,
      },
    });

    // Extract location from metadata and filter drivers with valid locations
    const driversWithLocation = drivers
      .map((driver) => {
        const metadata = driver.metadata as any;
        const location = metadata?.current_location;
        
        if (location && location.lat && location.lng) {
          return {
            id: driver.id,
            name: driver.name,
            phone: driver.phone,
            profile_photo_url: driver.profile_photo_url,
            lat: location.lat,
            lng: location.lng,
            status: metadata?.driver_status || 'offline',
          };
        }
        return null;
      })
      .filter((driver) => driver !== null);

    sendSuccess(res, driversWithLocation, 'تم تحميل مواقع السائقين على الخريطة بنجاح');
  } catch (error) {
    console.error('Get map drivers error:', error);
    sendError(res, 'حدث خطأ أثناء تحميل مواقع السائقين. يرجى المحاولة مرة أخرى', 500);
  }
};

// Featured Orders CRUD
export const createFeaturedOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { context, start_date, end_date, is_active = true } = req.body;

    if (!context || !start_date || !end_date) {
      sendError(res, 'يجب توفير المحتوى وتاريخ البدء وتاريخ الانتهاء. يرجى إكمال جميع الحقول المطلوبة', 400);
      return;
    }

    const featuredOrder = await prisma.featuredOrder.create({
      data: {
        context,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        is_active: Boolean(is_active),
      },
    });

    sendSuccess(res, featuredOrder, 'تم إنشاء الطلب المميز بنجاح! سيظهر للعملاء في التطبيق');
  } catch (error) {
    console.error('Create featured order error:', error);
    sendError(res, 'حدث خطأ أثناء إنشاء الطلب المميز. يرجى المحاولة مرة أخرى', 500);
  }
};

export const getFeaturedOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, is_active } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (is_active !== undefined) {
      where.is_active = is_active === 'true';
    }

    const [featuredOrders, total] = await Promise.all([
      prisma.featuredOrder.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.featuredOrder.count({ where }),
    ]);

    const totalPages = Math.ceil(total / Number(limit));

    sendPaginatedSuccess(res, featuredOrders, {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages,
    }, 'تم تحميل الطلبات المميزة بنجاح');
  } catch (error) {
    console.error('Get featured orders error:', error);
    sendError(res, 'حدث خطأ أثناء تحميل الطلبات المميزة. يرجى المحاولة مرة أخرى', 500);
  }
};

export const getFeaturedOrderById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const featuredOrder = await prisma.featuredOrder.findUnique({
      where: { id },
    });

    if (!featuredOrder) {
      sendError(res, 'لم يتم العثور على الطلب المميز. يرجى التحقق من رقم الطلب', 404);
      return;
    }

    sendSuccess(res, featuredOrder, 'تم تحميل تفاصيل الطلب المميز بنجاح');
  } catch (error) {
    console.error('Get featured order by id error:', error);
    sendError(res, 'حدث خطأ أثناء تحميل تفاصيل الطلب المميز. يرجى المحاولة مرة أخرى', 500);
  }
};

export const updateFeaturedOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { context, start_date, end_date, is_active } = req.body;

    const updateData: any = {};
    if (context !== undefined) updateData.context = context;
    if (start_date !== undefined) updateData.start_date = new Date(start_date);
    if (end_date !== undefined) updateData.end_date = new Date(end_date);
    if (is_active !== undefined) updateData.is_active = Boolean(is_active);

    const featuredOrder = await prisma.featuredOrder.update({
      where: { id },
      data: updateData,
    });

    sendSuccess(res, featuredOrder, 'تم تحديث الطلب المميز بنجاح! تم حفظ التغييرات');
  } catch (error) {
    console.error('Update featured order error:', error);
    if ((error as any).code === 'P2025') {
      sendError(res, 'لم يتم العثور على الطلب المميز. يرجى التحقق من رقم الطلب', 404);
    } else {
      sendError(res, 'حدث خطأ أثناء تحديث الطلب المميز. يرجى المحاولة مرة أخرى', 500);
    }
  }
};

export const deleteFeaturedOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.featuredOrder.delete({
      where: { id },
    });

    sendSuccess(res, null, 'تم حذف الطلب المميز بنجاح');
  } catch (error) {
    console.error('Delete featured order error:', error);
    if ((error as any).code === 'P2025') {
      sendError(res, 'لم يتم العثور على الطلب المميز. يرجى التحقق من رقم الطلب', 404);
    } else {
      sendError(res, 'حدث خطأ أثناء حذف الطلب المميز. يرجى المحاولة مرة أخرى', 500);
    }
  }
};

// Banners CRUD
export const createBanner = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { title, image_url, link, order_index = 0, is_active = true } = req.body;

    if (!image_url) {
      sendError(res, 'يجب توفير رابط الصورة. يرجى إضافة رابط صورة للإعلان', 400);
      return;
    }

    const banner = await prisma.banner.create({
      data: {
        title,
        image_url,
        link,
        order_index: Number(order_index),
        is_active: Boolean(is_active),
      },
    });

    sendSuccess(res, banner, 'تم إنشاء الإعلان بنجاح! سيظهر في التطبيق', 201);
  } catch (error) {
    console.error('Create banner error:', error);
    sendError(res, 'حدث خطأ أثناء إنشاء الإعلان. يرجى المحاولة مرة أخرى', 500);
  }
};

export const getBanners = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { is_active } = req.query;

    const where: any = {};
    if (is_active !== undefined) {
      where.is_active = is_active === 'true';
    }

    const banners = await prisma.banner.findMany({
      where,
      orderBy: { order_index: 'asc' },
    });

    sendSuccess(res, banners, 'تم تحميل الإعلانات بنجاح');
  } catch (error) {
    console.error('Get banners error:', error);
    sendError(res, 'حدث خطأ أثناء تحميل الإعلانات. يرجى المحاولة مرة أخرى', 500);
  }
};

export const getBannerById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const banner = await prisma.banner.findUnique({
      where: { id },
    });

    if (!banner) {
      sendError(res, 'لم يتم العثور على الإعلان. يرجى التحقق من رقم الإعلان', 404);
      return;
    }

    sendSuccess(res, banner, 'تم تحميل تفاصيل الإعلان بنجاح');
  } catch (error) {
    console.error('Get banner by id error:', error);
    sendError(res, 'حدث خطأ أثناء تحميل تفاصيل الإعلان. يرجى المحاولة مرة أخرى', 500);
  }
};

export const updateBanner = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, image_url, link, order_index, is_active } = req.body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (image_url !== undefined) updateData.image_url = image_url;
    if (link !== undefined) updateData.link = link;
    if (order_index !== undefined) updateData.order_index = Number(order_index);
    if (is_active !== undefined) updateData.is_active = Boolean(is_active);

    const banner = await prisma.banner.update({
      where: { id },
      data: updateData,
    });

    sendSuccess(res, banner, 'تم تحديث الإعلان بنجاح! تم حفظ التغييرات');
  } catch (error) {
    console.error('Update banner error:', error);
    if ((error as any).code === 'P2025') {
      sendError(res, 'لم يتم العثور على الإعلان. يرجى التحقق من رقم الإعلان', 404);
    } else {
      sendError(res, 'حدث خطأ أثناء تحديث الإعلان. يرجى المحاولة مرة أخرى', 500);
    }
  }
};

export const deleteBanner = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.banner.delete({
      where: { id },
    });

    sendSuccess(res, null, 'تم حذف الإعلان بنجاح');
  } catch (error) {
    console.error('Delete banner error:', error);
    if ((error as any).code === 'P2025') {
      sendError(res, 'لم يتم العثور على الإعلان. يرجى التحقق من رقم الإعلان', 404);
    } else {
      sendError(res, 'حدث خطأ أثناء حذف الإعلان. يرجى المحاولة مرة أخرى', 500);
    }
  }
};