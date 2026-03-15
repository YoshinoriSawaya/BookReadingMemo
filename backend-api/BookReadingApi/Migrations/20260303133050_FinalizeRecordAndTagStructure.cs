using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookReadingApi.Migrations
{
    /// <inheritdoc />
    public partial class FinalizeRecordAndTagStructure : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MasterTags",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MasterTags", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "QuoteRecords",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    BookId = table.Column<int>(type: "int", nullable: false),
                    Text = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PageNumber = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
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
                        name: "FK_QuoteRecords_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserTags",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MasterTagId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserTags", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserTags_MasterTags_MasterTagId",
                        column: x => x.MasterTagId,
                        principalTable: "MasterTags",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ThoughtRecords",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    BookId = table.Column<int>(type: "int", nullable: false),
                    QuoteRecordId = table.Column<int>(type: "int", nullable: true),
                    MasterTagId = table.Column<int>(type: "int", nullable: false),
                    UserTagId = table.Column<int>(type: "int", nullable: true),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
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
                        name: "FK_ThoughtRecords_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
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
        }
    }
}
