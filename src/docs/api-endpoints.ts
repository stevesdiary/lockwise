/**
 * @swagger
 * components:
 *   schemas:
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         message:
 *           type: string
 *         data:
 *           type: object
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: User login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Invalid credentials
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Authentication]
 *     summary: User logout
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /auth/google/login:
 *   get:
 *     tags: [Authentication]
 *     summary: Google OAuth login
 *     responses:
 *       302:
 *         description: Redirect to Google OAuth
 */

/**
 * @swagger
 * /auth/password/reset:
 *   post:
 *     tags: [Authentication]
 *     summary: Request password reset
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Reset email sent
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /user/register:
 *   post:
 *     tags: [Users]
 *     summary: Register new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [first_name, last_name, email, password, confirm_password]
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: John
 *               last_name:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: SecurePass123!
 *                 description: Must contain uppercase, lowercase, number, and special character
 *               confirm_password:
 *                 type: string
 *                 example: SecurePass123!
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 */

/**
 * @swagger
 * /user/all:
 *   get:
 *     tags: [Users]
 *     summary: Get all users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /user/one/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /user/delete/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Delete user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /estate/register:
 *   post:
 *     tags: [Estates]
 *     summary: Register new estate
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Estate'
 *     responses:
 *       201:
 *         description: Estate created successfully
 *       400:
 *         description: Validation error
 */

/**
 * @swagger
 * /estate/estates:
 *   get:
 *     tags: [Estates]
 *     summary: Get all estates
 *     responses:
 *       200:
 *         description: Estates retrieved successfully
 */

/**
 * @swagger
 * /estate/one/{estateId}:
 *   get:
 *     tags: [Estates]
 *     summary: Get estate by ID
 *     parameters:
 *       - name: estateId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Estate retrieved successfully
 *       404:
 *         description: Estate not found
 */

/**
 * @swagger
 * /estate/update/{estateId}:
 *   put:
 *     tags: [Estates]
 *     summary: Update estate
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: estateId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Estate'
 *     responses:
 *       200:
 *         description: Estate updated successfully
 *       404:
 *         description: Estate not found
 */

/**
 * @swagger
 * /estate/delete/{estateId}:
 *   delete:
 *     tags: [Estates]
 *     summary: Delete estate
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: estateId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Estate deleted successfully
 *       404:
 *         description: Estate not found
 */

/**
 * @swagger
 * /access:
 *   post:
 *     tags: [Access Control]
 *     summary: Create access record
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AccessRecord'
 *     responses:
 *       201:
 *         description: Access record created
 *       400:
 *         description: Validation error
 *   get:
 *     tags: [Access Control]
 *     summary: Get all access records
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Access records retrieved
 */

/**
 * @swagger
 * /access/active:
 *   get:
 *     tags: [Access Control]
 *     summary: Get active access records
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active access records retrieved
 */

/**
 * @swagger
 * /access/{accessId}/approve:
 *   put:
 *     tags: [Access Control]
 *     summary: Approve access request
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: accessId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Access approved
 *       404:
 *         description: Access record not found
 */

/**
 * @swagger
 * /access/{accessId}/entry:
 *   post:
 *     tags: [Access Control]
 *     summary: Record entry
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: accessId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Entry recorded
 */

/**
 * @swagger
 * /access/{accessId}/exit:
 *   post:
 *     tags: [Access Control]
 *     summary: Record exit
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: accessId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Exit recorded
 */

/**
 * @swagger
 * /access-codes/generate:
 *   post:
 *     tags: [Access Control]
 *     summary: Generate access code
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Access code generated
 */

/**
 * @swagger
 * /access-codes/validate:
 *   post:
 *     tags: [Access Control]
 *     summary: Validate access code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [access_code]
 *             properties:
 *               access_code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Access code validated
 *       400:
 *         description: Invalid access code
 */

/**
 * @swagger
 * /payment/initiate:
 *   post:
 *     tags: [Payments]
 *     summary: Initiate payment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentInitiation'
 *     responses:
 *       200:
 *         description: Payment initiated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentResponse'
 *       400:
 *         description: Validation error
 */

/**
 * @swagger
 * /payment/verify/{reference}:
 *   get:
 *     tags: [Payments]
 *     summary: Verify payment
 *     parameters:
 *       - name: reference
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment verification result
 *       404:
 *         description: Payment not found
 */

/**
 * @swagger
 * /payment/all:
 *   get:
 *     tags: [Payments]
 *     summary: Get all payments
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 50
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of payments
 */

/**
 * @swagger
 * /payment/id/{paymentId}:
 *   get:
 *     tags: [Payments]
 *     summary: Get payment by ID
 *     parameters:
 *       - name: paymentId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment details
 */

/**
 * @swagger
 * /plan:
 *   get:
 *     tags: [Plans]
 *     summary: Get all plans
 *     responses:
 *       200:
 *         description: Plans retrieved successfully
 *   post:
 *     tags: [Plans]
 *     summary: Create plan
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Plan'
 *     responses:
 *       201:
 *         description: Plan created successfully
 */

/**
 * @swagger
 * /plan/{id}:
 *   get:
 *     tags: [Plans]
 *     summary: Get plan by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Plan retrieved successfully
 *   put:
 *     tags: [Plans]
 *     summary: Update plan
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Plan'
 *     responses:
 *       200:
 *         description: Plan updated successfully
 *   delete:
 *     tags: [Plans]
 *     summary: Delete plan
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Plan deleted successfully
 */

/**
 * @swagger
 * /referral/register:
 *   post:
 *     tags: [Referrals]
 *     summary: Register referrer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Referral'
 *     responses:
 *       201:
 *         description: Referrer registered successfully
 */

/**
 * @swagger
 * /referral/{code}:
 *   get:
 *     tags: [Referrals]
 *     summary: Get referrer by code
 *     parameters:
 *       - name: code
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Referrer retrieved successfully
 */

/**
 * @swagger
 * /referral:
 *   get:
 *     tags: [Referrals]
 *     summary: List all referrers
 *     responses:
 *       200:
 *         description: Referrers retrieved successfully
 */

/**
 * @swagger
 * /amenities/estate/{estateId}:
 *   get:
 *     tags: [Amenities]
 *     summary: Get estate amenities
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: estateId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Amenities retrieved successfully
 *   post:
 *     tags: [Amenities]
 *     summary: Create amenity
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: estateId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Amenity'
 *     responses:
 *       201:
 *         description: Amenity created successfully
 */

/**
 * @swagger
 * /amenities/{amenityId}:
 *   patch:
 *     tags: [Amenities]
 *     summary: Update amenity
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: amenityId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Amenity'
 *     responses:
 *       200:
 *         description: Amenity updated successfully
 *   delete:
 *     tags: [Amenities]
 *     summary: Delete amenity
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: amenityId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Amenity deleted successfully
 */

/**
 * @swagger
 * /community/posts:
 *   get:
 *     tags: [Community]
 *     summary: Get community posts
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Posts retrieved successfully
 *   post:
 *     tags: [Community]
 *     summary: Create community post
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CommunityPost'
 *     responses:
 *       201:
 *         description: Post created successfully
 */

/**
 * @swagger
 * /community/posts/{postId}/comments:
 *   post:
 *     tags: [Community]
 *     summary: Add comment to post
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: postId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment added successfully
 */

/**
 * @swagger
 * /community/announcements:
 *   post:
 *     tags: [Community]
 *     summary: Create announcement
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, content]
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Announcement created successfully
 */

/**
 * @swagger
 * /community/meetings:
 *   post:
 *     tags: [Community]
 *     summary: Create meeting
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, date, location]
 *             properties:
 *               title:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               location:
 *                 type: string
 *     responses:
 *       201:
 *         description: Meeting created successfully
 */

/**
 * @swagger
 * /support/tickets:
 *   post:
 *     tags: [Support]
 *     summary: Create support ticket
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SupportTicket'
 *     responses:
 *       201:
 *         description: Ticket created successfully
 */

/**
 * @swagger
 * /support/tickets/my:
 *   get:
 *     tags: [Support]
 *     summary: Get my tickets
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tickets retrieved successfully
 */

/**
 * @swagger
 * /support/tickets/open:
 *   get:
 *     tags: [Support]
 *     summary: Get open tickets
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Open tickets retrieved successfully
 */

/**
 * @swagger
 * /support/tickets/{ticketId}/messages:
 *   get:
 *     tags: [Support]
 *     summary: Get ticket messages
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: ticketId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
 *   post:
 *     tags: [Support]
 *     summary: Send message
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: ticketId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent successfully
 */

/**
 * @swagger
 * /faqs:
 *   get:
 *     tags: [Community]
 *     summary: Get FAQs
 *     parameters:
 *       - name: category
 *         in: query
 *         schema:
 *           type: string
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: FAQs retrieved successfully
 *   post:
 *     tags: [Community]
 *     summary: Create FAQ
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FAQ'
 *     responses:
 *       201:
 *         description: FAQ created successfully
 */

/**
 * @swagger
 * /faqs/{id}:
 *   put:
 *     tags: [Community]
 *     summary: Update FAQ
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FAQ'
 *     responses:
 *       200:
 *         description: FAQ updated successfully
 *   delete:
 *     tags: [Community]
 *     summary: Delete FAQ
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: FAQ deleted successfully
 */

/**
 * @swagger
 * /analytics/detailed:
 *   get:
 *     tags: [Analytics]
 *     summary: Get detailed system analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics retrieved successfully
 */

/**
 * @swagger
 * /analytics/estate/{estateId}:
 *   get:
 *     tags: [Analytics]
 *     summary: Get estate analytics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: estateId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Estate analytics retrieved successfully
 */

/**
 * @swagger
 * /analytics/revenue:
 *   get:
 *     tags: [Analytics]
 *     summary: Get revenue analytics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: period
 *         in: query
 *         schema:
 *           type: string
 *           enum: [week, month, year]
 *           default: month
 *     responses:
 *       200:
 *         description: Revenue analytics retrieved successfully
 */

/**
 * @swagger
 * /upload/upload:
 *   post:
 *     tags: [Upload]
 *     summary: Upload file
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *       400:
 *         description: Invalid file
 */

/**
 * @swagger
 * /upload/files:
 *   get:
 *     tags: [Upload]
 *     summary: Get uploaded files
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Files retrieved successfully
 */

/**
 * @swagger
 * /bulk-upload/estates:
 *   post:
 *     tags: [Upload]
 *     summary: Bulk upload estates
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Estates uploaded successfully
 */

/**
 * @swagger
 * /address:
 *   post:
 *     tags: [Location]
 *     summary: Create address
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Address'
 *     responses:
 *       201:
 *         description: Address created successfully
 */

/**
 * @swagger
 * /address/map/{estateId}:
 *   get:
 *     tags: [Location]
 *     summary: Get estate map data
 *     parameters:
 *       - name: estateId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Map data retrieved successfully
 */

/**
 * @swagger
 * /mobile/register:
 *   post:
 *     tags: [Mobile]
 *     summary: Register mobile device
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [device_id, platform]
 *             properties:
 *               device_id:
 *                 type: string
 *               platform:
 *                 type: string
 *                 enum: [ios, android]
 *               push_token:
 *                 type: string
 *     responses:
 *       201:
 *         description: Device registered successfully
 */

/**
 * @swagger
 * /admin/register:
 *   post:
 *     tags: [Admin]
 *     summary: Register admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, secret_key]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               secret_key:
 *                 type: string
 *     responses:
 *       201:
 *         description: Admin registered successfully
 */

/**
 * @swagger
 * /admin/agents/create:
 *   post:
 *     tags: [Admin]
 *     summary: Create customer service agent
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, name]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Agent created successfully
 */

/**
 * @swagger
 * /parking:
 *   get:
 *     tags: [Parking]
 *     summary: Get parking slots
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Parking slots retrieved successfully
 */

/**
 * @swagger
 * /ev-charging:
 *   get:
 *     tags: [Parking]
 *     summary: Get EV charging stations
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: EV charging stations retrieved successfully
 */

/**
 * @swagger
 * /notifications:
 *   post:
 *     tags: [Notifications]
 *     summary: Send notification
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Notification'
 *     responses:
 *       200:
 *         description: Notification sent successfully
 */

/**
 * @swagger
 * /chat/create:
 *   post:
 *     tags: [Support]
 *     summary: Create support chat
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [subject]
 *             properties:
 *               subject:
 *                 type: string
 *     responses:
 *       201:
 *         description: Chat created successfully
 */

/**
 * @swagger
 * /emergency:
 *   post:
 *     tags: [Communication]
 *     summary: Report emergency
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, description]
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [fire, medical, security, other]
 *               description:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       201:
 *         description: Emergency reported successfully
 */

/**
 * @swagger
 * /legal/terms:
 *   get:
 *     tags: [Legal]
 *     summary: Get terms and conditions
 *     responses:
 *       200:
 *         description: Terms retrieved successfully
 */

/**
 * @swagger
 * /legal/privacy:
 *   get:
 *     tags: [Legal]
 *     summary: Get privacy policy
 *     responses:
 *       200:
 *         description: Privacy policy retrieved successfully
 */

/**
 * @swagger
 * /api/v1/chat/create:
 *   post:
 *     summary: Create a new support chat
 *     tags: [Chat Support]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - subject
 *             properties:
 *               userId:
 *                 type: string
 *               subject:
 *                 type: string
 *     responses:
 *       200:
 *         description: Chat created successfully
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/chat/send:
 *   post:
 *     summary: Send a chat message
 *     tags: [Chat Support]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - chatId
 *               - message
 *               - senderId
 *             properties:
 *               chatId:
 *                 type: string
 *               message:
 *                 type: string
 *               senderId:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [user, support]
 *     responses:
 *       200:
 *         description: Message sent successfully
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/chat/history/{chatId}:
 *   get:
 *     summary: Get chat history
 *     tags: [Chat Support]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chat history retrieved
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/plan:
 *   get:
 *     summary: Get all plans
 *     tags: [Plans]
 *     responses:
 *       200:
 *         description: List of plans
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/plan/{id}:
 *   get:
 *     summary: Get plan by ID
 *     tags: [Plans]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Plan details
 *       404:
 *         description: Plan not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/plan:
 *   post:
 *     summary: Create a new plan
 *     tags: [Plans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Plan created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/plan/{id}:
 *   put:
 *     summary: Update plan by ID
 *     tags: [Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Plan updated successfully
 *       404:
 *         description: Plan not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/plan/{id}:
 *   delete:
 *     summary: Delete plan by ID
 *     tags: [Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Plan deleted successfully
 *       404:
 *         description: Plan not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Invalid credentials
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: User logout
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/bulk-upload/estates:
 *   post:
 *     summary: Bulk upload estates from Excel/CSV file
 *     tags: [Bulk Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Excel (.xlsx, .xls) or CSV file with estate data
 *     responses:
 *       200:
 *         description: Bulk upload completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalProcessed:
 *                       type: integer
 *                     successCount:
 *                       type: integer
 *                     errorCount:
 *                       type: integer
 *                     errors:
 *                       type: array
 *                       items:
 *                         type: object
 *       400:
 *         description: Invalid file or validation error
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/bulk-upload/residents:
 *   post:
 *     summary: Bulk upload residents from Excel/CSV file
 *     tags: [Bulk Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Excel (.xlsx, .xls) or CSV file with resident data
 *     responses:
 *       200:
 *         description: Bulk upload completed
 *       400:
 *         description: Invalid file or validation error
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/bulk-upload/addresses:
 *   post:
 *     summary: Bulk upload addresses for an estate from Excel/CSV file
 *     tags: [Bulk Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - estateId
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Excel (.xlsx, .xls) or CSV file with address data
 *               estateId:
 *                 type: string
 *                 description: Estate ID to associate addresses with
 *     responses:
 *       200:
 *         description: Bulk upload completed
 *       400:
 *         description: Invalid file, missing estate ID, or validation error
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/bulk-upload/template/{type}:
 *   get:
 *     summary: Get upload template format and sample data
 *     tags: [Bulk Upload]
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [estates, residents, addresses, streets-units]
 *         description: Template type
 *     responses:
 *       200:
 *         description: Template information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                     headers:
 *                       type: array
 *                       items:
 *                         type: string
 *                     sampleData:
 *                       type: array
 *                       items:
 *                         type: string
 *                     instructions:
 *                       type: string
 *       400:
 *         description: Invalid template type
 */