using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace BookReading.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddUserQuoteThoughts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MasterTags",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MasterTags", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "User",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_User", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "QuoteRecords",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    BookId = table.Column<int>(type: "integer", nullable: false),
                    Text = table.Column<string>(type: "text", nullable: false),
                    PageNumber = table.Column<int>(type: "integer", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuoteRecords", x => x.Id);
                    table.ForeignKey(
                        name: "FK_QuoteRecords_Books_BookId",
                        column: x => x.BookId,
                        principalTable: "Books",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_QuoteRecords_User_UserId",
                        column: x => x.UserId,
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserTags",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MasterTagId = table.Column<int>(type: "integer", nullable: false),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserTags", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserTags_MasterTags_MasterTagId",
                        column: x => x.MasterTagId,
                        principalTable: "MasterTags",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UserTags_User_UserId",
                        column: x => x.UserId,
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ThoughtRecords",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    BookId = table.Column<int>(type: "integer", nullable: false),
                    QuoteRecordId = table.Column<int>(type: "integer", nullable: true),
                    MasterTagId = table.Column<int>(type: "integer", nullable: false),
                    UserTagId = table.Column<int>(type: "integer", nullable: true),
                    Content = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ThoughtRecords", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ThoughtRecords_Books_BookId",
                        column: x => x.BookId,
                        principalTable: "Books",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ThoughtRecords_MasterTags_MasterTagId",
                        column: x => x.MasterTagId,
                        principalTable: "MasterTags",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ThoughtRecords_QuoteRecords_QuoteRecordId",
                        column: x => x.QuoteRecordId,
                        principalTable: "QuoteRecords",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ThoughtRecords_UserTags_UserTagId",
                        column: x => x.UserTagId,
                        principalTable: "UserTags",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ThoughtRecords_User_UserId",
                        column: x => x.UserId,
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "MasterTags",
                columns: new[] { "Id", "CreatedAt", "DeletedAt", "IsDeleted", "Name", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 3, 20, 0, 0, 0, 0, DateTimeKind.Utc), null, false, "感銘を受けた", new DateTime(2026, 3, 20, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 2, new DateTime(2026, 3, 20, 0, 0, 0, 0, DateTimeKind.Utc), null, false, "新しい発見", new DateTime(2026, 3, 20, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 3, new DateTime(2026, 3, 20, 0, 0, 0, 0, DateTimeKind.Utc), null, false, "要約・まとめ", new DateTime(2026, 3, 20, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 4, new DateTime(2026, 3, 20, 0, 0, 0, 0, DateTimeKind.Utc), null, false, "批判的思考", new DateTime(2026, 3, 20, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 5, new DateTime(2026, 3, 20, 0, 0, 0, 0, DateTimeKind.Utc), null, false, "実践したい", new DateTime(2026, 3, 20, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 6, new DateTime(2026, 3, 20, 0, 0, 0, 0, DateTimeKind.Utc), null, false, "疑問・調査", new DateTime(2026, 3, 20, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 7, new DateTime(2026, 3, 20, 0, 0, 0, 0, DateTimeKind.Utc), null, false, "関連書籍あり", new DateTime(2026, 3, 20, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 8, new DateTime(2026, 3, 20, 0, 0, 0, 0, DateTimeKind.Utc), null, false, "お気に入り", new DateTime(2026, 3, 20, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 9, new DateTime(2026, 3, 20, 0, 0, 0, 0, DateTimeKind.Utc), null, false, "難解", new DateTime(2026, 3, 20, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 10, new DateTime(2026, 3, 20, 0, 0, 0, 0, DateTimeKind.Utc), null, false, "その他", new DateTime(2026, 3, 20, 0, 0, 0, 0, DateTimeKind.Utc) }
                });

            migrationBuilder.CreateIndex(
                name: "IX_QuoteRecords_BookId",
                table: "QuoteRecords",
                column: "BookId");

            migrationBuilder.CreateIndex(
                name: "IX_QuoteRecords_UserId",
                table: "QuoteRecords",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ThoughtRecords_BookId",
                table: "ThoughtRecords",
                column: "BookId");

            migrationBuilder.CreateIndex(
                name: "IX_ThoughtRecords_MasterTagId",
                table: "ThoughtRecords",
                column: "MasterTagId");

            migrationBuilder.CreateIndex(
                name: "IX_ThoughtRecords_QuoteRecordId",
                table: "ThoughtRecords",
                column: "QuoteRecordId");

            migrationBuilder.CreateIndex(
                name: "IX_ThoughtRecords_UserId",
                table: "ThoughtRecords",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ThoughtRecords_UserTagId",
                table: "ThoughtRecords",
                column: "UserTagId");

            migrationBuilder.CreateIndex(
                name: "IX_UserTags_MasterTagId",
                table: "UserTags",
                column: "MasterTagId");

            migrationBuilder.CreateIndex(
                name: "IX_UserTags_UserId",
                table: "UserTags",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ThoughtRecords");

            migrationBuilder.DropTable(
                name: "QuoteRecords");

            migrationBuilder.DropTable(
                name: "UserTags");

            migrationBuilder.DropTable(
                name: "MasterTags");

            migrationBuilder.DropTable(
                name: "User");
        }
    }
}
