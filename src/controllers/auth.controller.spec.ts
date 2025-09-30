import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { CreateUserDto, LoginDto } from '../dtos/auth.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    username: 'testuser',
    firstName: 'John',
    lastName: 'Doe',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAccessToken = 'mock.jwt.token';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
      };

      const expectedResponse = {
        message: 'User registered successfully',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          username: mockUser.username,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
        },
      };

      mockAuthService.register.mockResolvedValue(expectedResponse);

      const result = await controller.register(createUserDto);

      expect(mockAuthService.register).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle registration with existing email', async () => {
      const createUserDto: CreateUserDto = {
        email: 'existing@example.com',
        username: 'testuser',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
      };

      const error = new Error('User with this email already exists');
      mockAuthService.register.mockRejectedValue(error);

      await expect(controller.register(createUserDto)).rejects.toThrow(error);
      expect(mockAuthService.register).toHaveBeenCalledWith(createUserDto);
    });

    it('should handle validation errors', async () => {
      const incompleteDto = {
        email: 'test@example.com',
      } as CreateUserDto;

      mockAuthService.register.mockRejectedValue(
        new Error('Validation failed'),
      );

      await expect(controller.register(incompleteDto)).rejects.toThrow();
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      const expectedResponse = {
        access_token: mockAccessToken,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          username: mockUser.username,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
        },
      };

      mockAuthService.login.mockResolvedValue(expectedResponse);

      const result = await controller.login(loginDto);

      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(expectedResponse);
      expect(result.access_token).toBeDefined();
    });

    it('should handle invalid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const error = new Error('Invalid credentials');
      mockAuthService.login.mockRejectedValue(error);

      await expect(controller.login(loginDto)).rejects.toThrow(error);
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should handle missing credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
      } as LoginDto;

      mockAuthService.login.mockRejectedValue(new Error('Validation failed'));

      await expect(controller.login(loginDto)).rejects.toThrow();
    });
  });

  describe('controller definition', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have register method', () => {
      expect(typeof controller.register).toBe('function');
    });

    it('should have login method', () => {
      expect(typeof controller.login).toBe('function');
    });
  });

  describe('error handling', () => {
    it('should handle service errors in register', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
      };

      const serviceError = new Error('Database connection failed');
      mockAuthService.register.mockRejectedValue(serviceError);

      await expect(controller.register(createUserDto)).rejects.toThrow(
        serviceError,
      );
    });

    it('should handle service errors in login', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      const serviceError = new Error('Authentication service unavailable');
      mockAuthService.login.mockRejectedValue(serviceError);

      await expect(controller.login(loginDto)).rejects.toThrow(serviceError);
    });
  });
});
